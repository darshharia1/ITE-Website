# AWS Deployment Guide for ITE Backend Docker Image

## Prerequisites
- **Docker** installed locally (Docker Desktop or Docker Engine).
- **AWS CLI** configured with credentials that have permission to push to **Amazon Elastic Container Registry (ECR)** and to deploy to the target service (e.g., ECS/Fargate, EKS, or AWS App Runner).
- An existing **ECR repository** for the backend image (create one if needed).
- Environment variables ready in a `.env` file or via AWS Parameter Store/Secrets Manager.

## 1. Build the Docker Image Locally
```bash
# From the project root (backend folder)
cd /Users/parthlande2006/.gemini/antigravity/scratch/backend

# Build the image – tag with your ECR repo URI (replace <aws_account_id> and <region>)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
REPO_NAME=ite-backend
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME"

# Build (multi‑stage) image
docker build -t $REPO_NAME:latest .
```

## 2. Authenticate Docker to ECR
```bash
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

## 3. Tag and Push the Image to ECR
```bash
# Tag the local image with the full ECR URI
docker tag $REPO_NAME:latest $ECR_URI:latest

# Push to ECR
docker push $ECR_URI:latest
```

## 4. Deploy the Image
Choose the AWS service that matches your architecture.

### 4.1 Amazon ECS (Fargate) – Quick Steps
1. **Create a task definition** using the image URI `$ECR_URI:latest`.
2. Set the container port to `3000` (or the `PORT` you configure).
3. Add environment variables – you can reference a `.env` file locally, but in production map them via **AWS Systems Manager Parameter Store** or **Secrets Manager**.
4. Create a **service** in your ECS cluster using the task definition.
5. Optionally configure an **Application Load Balancer** to expose the service.

### 4.2 AWS App Runner (simpler managed service)
```bash
aws apprunner create-service \
  --service-name ite-backend \
  --source-configuration "ImageRepository={ImageIdentifier=$ECR_URI:latest,ImageRepositoryType=ECR}", \
  --runtime-configuration "Port=3000"
```
The service will automatically pull the latest image and handle scaling.

### 4.3 Amazon EKS (Kubernetes) – Example Manifest
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ite-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ite-backend
  template:
    metadata:
      labels:
        app: ite-backend
    spec:
      containers:
        - name: ite-backend
          image: $ECR_URI:latest
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: ite-backend-secrets   # stores DATABASE_URL, AWS keys, etc.
---
apiVersion: v1
kind: Service
metadata:
  name: ite-backend-svc
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
  selector:
    app: ite-backend
```
Apply with `kubectl apply -f deployment.yaml`.

## 5. Verify the Deployment
- **ECS/Fargate**: Check the task logs in the ECS console.
- **App Runner**: The console shows a health‑check URL.
- **EKS**: `kubectl get svc ite-backend-svc` to obtain the external IP/DNS.

## 6. Updating the Service
Whenever you make code changes:
```bash
# Re‑build and push
docker build -t $REPO_NAME:latest .
docker tag $REPO_NAME:latest $ECR_URI:latest
docker push $ECR_URI:latest
```
- ECS: Update the service to force a new deployment (`aws ecs update-service … --force-new-deployment`).
- App Runner: It automatically pulls the new image if you enable **automatic deployments**.
- EKS: `kubectl rollout restart deployment/ite-backend`.

---
**Tips**
- Keep your `Dockerfile` unchanged – it already uses a multi‑stage build and runs as a non‑root user for security.
- Store secrets outside the image; never hard‑code them.
- Enable health‑checks in your orchestration platform (using the `/health` endpoint).

---
*This guide lives at `backend/aws-deploy.md` for easy reference.*
