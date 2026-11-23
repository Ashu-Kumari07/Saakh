/* Small helpers shared by every file. */
const $=s=>document.querySelector(s),rs=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.add('hidden'),2600)};
const I=(n,c='')=>`<span class="material-symbols-outlined ${c}" aria-hidden="true">${n}</span>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
