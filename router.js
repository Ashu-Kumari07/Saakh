/* Hash router with role guard (vendor and lender pages are separate). Must load last. */
const nav=h=>location.hash=='#'+h?view():location.hash=h,go=r=>{S.pick=r;nav('login')};
const out=()=>{S.role=null;nav('login')};
const VR=['home','voice','confirm','ledger','score','privacy','consent'],LR=['applications','ramesh','vikas'];
function view(keepScroll){let r=location.hash.slice(1)||'landing';if(!P[r])r='landing';const v=VR.includes(r),l=LR.includes(r);if(v&&S.role!='vendor'||l&&S.role!='lender'){S.pick=v?'vendor':'lender';r='login';history.replaceState(null,'','#login')}$('#app').innerHTML=P[r]();if(r=='confirm'&&S.draft)up();if(keepScroll!==1)scrollTo(0,0)}
addEventListener('hashchange',()=>view());view();
