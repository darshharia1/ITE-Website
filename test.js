const fs = require('fs');

const window = {};
window.ITE = {};
global.window = window;
global.document = {
  getElementById: (id) => {
    return {
      innerHTML: '',
      classList: { add: ()=>{}, remove: ()=>{} },
      style: {},
      addEventListener: ()=>{}
    };
  },
  createElement: () => ({})
};
global.localStorage = { getItem:()=>null, setItem:()=>{} };
global.sessionStorage = { getItem:()=>null, setItem:()=>{} };

eval(fs.readFileSync('js/app.js', 'utf8'));
eval(fs.readFileSync('js/data.js', 'utf8'));
eval(fs.readFileSync('js/pages/admin.js', 'utf8'));

window.ITE.Data.init();
window.ITE.App.pc = () => document.getElementById('page-content');
window.ITE.App.roleColor = () => '#000';
window.ITE.App.renderProgressTracker = () => '';

try {
  window.ITE.Pages.Admin.renderDashboard();
  console.log("Dashboard Success!");
} catch (e) {
  console.error("Dashboard Error:", e);
}

try {
  window.ITE.Pages.Admin.renderStudents();
  console.log("Students Success!");
} catch (e) {
  console.error("Students Error:", e);
}
