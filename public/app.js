'use strict';
const $=(s,root=document)=>root.querySelector(s);const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Give every page section a composed entrance, with staggered details and one gently moving visual.
const motionSections=$$('main > section, main > form.availability');
motionSections.forEach((section,sectionIndex)=>{
 section.classList.add('motion-section');
 const direct=[...section.children].filter(el=>!el.matches('script,style'));
 const details=$$('.section-head,.title-row,.story-text,.story-images,.collection-card,.moment-image,.moment-copy,.journal-heading,.journal-strip>*,.villa-photo,.villa-details,.comparison tr,.experience-card,.day-plan>*,.gallery-item,.guide-card,.location-copy,.map-frame,.contact-layout>*,.review-card,.faq-list>details,.calendar-intro,.calendar-right,.channel-link',section);
 [...new Set([...direct,...details])].forEach((el,index)=>{
  if(!el.classList.contains('reveal'))el.classList.add('motion-item');
  el.style.setProperty('--motion-delay',`${Math.min(index,10)*65}ms`);
  el.dataset.motion=(sectionIndex+index)%3===0?'left':(sectionIndex+index)%3===1?'rise':'scale';
 });
 $$('h2,h3',section).forEach((heading,index)=>{heading.classList.add('motion-heading');heading.style.setProperty('--motion-delay',`${120+index*70}ms`)});
 const visual=$('.frame,.inner-photo,.moment-image,.map-frame',section);
 if(visual)visual.classList.add('motion-media','motion-parallax');
});
if(!reduced&&'IntersectionObserver'in window){document.body.classList.add('motion-ready');const io=new IntersectionObserver(entries=>entries.forEach(e=>{e.target.classList.toggle('in-view',e.isIntersecting)}),{threshold:.08,rootMargin:'0px 0px 35px 0px'});$$('.reveal,.motion-item,.motion-section,.motion-heading,.motion-media').forEach(e=>io.observe(e));}
requestAnimationFrame(()=>document.body.classList.add('page-ready'));
const menu=$('.menu-toggle'),nav=$('nav');menu.addEventListener('click',()=>{let open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open)});$$('nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}));
let ticking=false;function scrollEffects(){let y=scrollY,total=document.documentElement.scrollHeight-innerHeight;$('.progress').style.width=`${total>0?y/total*100:0}%`;$('header').classList.toggle('compact',y>35);$('.floating-book').classList.toggle('visible',y>750);if(!reduced){if(y<1000&&$('.hero-media'))$('.hero-media').style.transform=`translateY(${y*.2}px)`;if(innerWidth>800)$$('.motion-parallax').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.setProperty('--motion-y',`${Math.max(-18,Math.min(18,(innerHeight/2-r.top-r.height/2)*.035))}px`)})}ticking=false}addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(scrollEffects);ticking=true}},{passive:true});scrollEffects();
const booking=$('#booking'),form=$('#booking-form'),quick=$('#availability'),summary=$('#booking-summary'),error=$('#booking-error');
if(form&&!form.elements.phone){const phoneLabel=document.createElement('label');phoneLabel.innerHTML='PHONE / WHATSAPP<input autocomplete="tel" maxlength="30" name="phone" placeholder="+94 77 000 0000" required type="tel"/>';form.elements.email.closest('label').before(phoneLabel);const trap=document.createElement('input');trap.type='text';trap.name='website';trap.tabIndex=-1;trap.autocomplete='off';trap.hidden=true;form.append(trap)}
const footerBottom=$('.new-footer .footer-bottom');if(footerBottom&&!footerBottom.querySelector('a[href="/admin"]')){const adminLink=document.createElement('a');adminLink.href='/admin';adminLink.className='footer-admin-link';adminLink.textContent='Staff Portal ↗';adminLink.setAttribute('aria-label','Open booking dashboard');footerBottom.insertBefore(adminLink,footerBottom.lastElementChild)}
function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}function nextDate(value){const d=new Date(value+'T12:00:00');d.setDate(d.getDate()+1);return localDate(d)}
function syncDates(f){if(!f||!f.elements)return;const a=f.elements.checkin,b=f.elements.checkout;if(!a||!b)return;a.min=localDate();b.min=a.value?nextDate(a.value):nextDate(localDate());b.setCustomValidity('');if(a.value&&b.value&&b.value<=a.value)b.setCustomValidity('Check-out must be after check-in.');}
function capacity(f){if(!f||!f.elements||!f.elements.villa)return;if(!['Araliya','Olu'].includes(f.elements.villa.value))f.elements.villa.value='Araliya';}
function updateSummary(){syncDates(form);let d=new FormData(form),n=Math.round((new Date(d.get('checkout')+'T12:00:00')-new Date(d.get('checkin')+'T12:00:00'))/86400000);summary.textContent=n>0?`${d.get('villa')} · ${n} night${n>1?'s':''} · ${d.get('guests')} guest${d.get('guests')==='1'?'':'s'}`:'';error.textContent=''}
[quick,form].filter(Boolean).forEach(f=>{syncDates(f);capacity(f);f.addEventListener('change',()=>{capacity(f);syncDates(f);if(f===form)updateSummary();window.dispatchEvent(new Event('staydateschange'));})});
function openBooking(values={}){if(!booking.open){$('#whatsapp-ready').hidden=true;form.hidden=false;error.textContent='';for(const [key,value]of Object.entries(values))if(form.elements[key]&&value!==undefined)form.elements[key].value=value;capacity(form);updateSummary();booking.showModal()}}
$$('[data-book]').forEach(b=>b.addEventListener('click',()=>openBooking({villa:b.dataset.choice||quick?.elements?.villa?.value||'Araliya',checkin:quick?.elements?.checkin?.value||'',checkout:quick?.elements?.checkout?.value||'',guests:quick?.elements?.guests?.value||'2',message:b.dataset.note||''})));
if(quick)quick.addEventListener('submit',e=>{e.preventDefault();syncDates(quick);if(quick.reportValidity())openBooking(Object.fromEntries(new FormData(quick)))});if($('.close-dialog')&&booking)$('.close-dialog').addEventListener('click',()=>booking.close());if(booking)booking.addEventListener('click',e=>{if(e.target===booking){const r=booking.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)booking.close()}});
if(form)form.addEventListener('submit',async e=>{e.preventDefault();updateSummary();if(!form.reportValidity())return;const d=Object.fromEntries(new FormData(form));if(!d.name.trim()){error.textContent='Please enter your name.';form.elements.name.focus();return}if(!d.phone.trim()){error.textContent='Please enter your phone or WhatsApp number.';form.elements.phone.focus();return}if(d.checkin<localDate()||d.checkout<=d.checkin){error.textContent='Please choose valid future dates, with check-out after check-in.';return}if(Number(d.guests)<1||Number(d.guests)>2){error.textContent='Each villa accommodates up to two guests.';return}const submit=form.querySelector('button[type="submit"]'),original=submit.innerHTML;submit.disabled=true;submit.textContent='Saving your request…';error.textContent='';try{const response=await fetch('/api/bookings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({guestName:d.name,email:d.email,phone:d.phone,villaName:d.villa,checkin:d.checkin,checkout:d.checkout,guests:Number(d.guests),specialRequest:d.message,website:d.website})});const result=await response.json();if(!response.ok||!result.booking)throw new Error(result.error||'Your request could not be saved.');const ref=result.booking.reference;const msg=`Hello Tranquil Terrace Galle!\nI'd like to enquire about a stay.\n\nReference: ${ref}\nVilla: ${d.villa}\nCheck-in: ${d.checkin}\nCheck-out: ${d.checkout}\nGuests: ${d.guests}\nName: ${d.name.trim()}\nPhone: ${d.phone.trim()}${d.email?'\nEmail: '+d.email:''}${d.message.trim()?'\n\nSpecial request: '+d.message.trim():''}\n\nPlease confirm availability, rates and booking terms. Thank you!`;$('#request-preview').textContent=msg;$('#whatsapp-link').href='https://wa.me/94770682366?text='+encodeURIComponent(msg);$('#whatsapp-ready>p').textContent=`Your request ${ref} is saved. Review it below, then open WhatsApp and press send.`;form.hidden=true;$('#whatsapp-ready').hidden=false;booking.scrollTop=0;$('#whatsapp-link').focus()}catch(err){error.textContent=err instanceof Error?err.message:'Your request could not be saved. Please try again.'}finally{submit.disabled=false;submit.innerHTML=original}});$('#edit-request').addEventListener('click',()=>{form.hidden=false;$('#whatsapp-ready').hidden=true;form.elements.name.focus()});
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});const filter=b.dataset.filter;$('.gallery-grid').classList.toggle('filtered',filter!=='all');$$('.gallery-item').forEach(item=>{item.hidden=filter!=='all'&&item.dataset.category!==filter;if(!item.hidden)item.classList.add('in-view')})}));
const lightbox=$('#lightbox'),captions=['The arrival · Tranquil Terrace Galle','Rest comes naturally · King bedroom','A private little world · The plunge pool','In good company with nature · The terrace','Slow mornings · Floating breakfast'];let photoIndex=0;function showPhoto(i){photoIndex=(i+5)%5;$('#lightbox img').src=`assets/villa-${photoIndex}.webp`;$('#lightbox img').alt=captions[photoIndex];$('#photo-caption').textContent=`${String(photoIndex+1).padStart(2,'0')} / 05 — ${captions[photoIndex]}`}
$$('[data-image]').forEach(b=>b.addEventListener('click',()=>{showPhoto(Number(b.dataset.image));lightbox.showModal()}));$('.close-lightbox').addEventListener('click',()=>lightbox.close());$('.next-photo').addEventListener('click',()=>showPhoto(photoIndex+1));$('.prev-photo').addEventListener('click',()=>showPhoto(photoIndex-1));lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight')showPhoto(photoIndex+1);if(e.key==='ArrowLeft')showPhoto(photoIndex-1)});



// Araliya and Olu are separate private villas. No live inventory is inferred.
const channelUrls={booking:'https://www.booking.com/hotel/lk/tranquil-terrace-galle-galle1.html?aid=356980',agoda:'https://www.agoda.com/tranquil-terrace-galle-h79594102/hotel/galle-lk.html',airbnb:'https://www.airbnb.co.in/rooms/1493263628966005427'};
function channelHref(provider,arrival='',departure='',guests='2'){
 const url=new URL(channelUrls[provider]);
 if(arrival&&departure&&departure>arrival){
  if(provider==='booking'){url.searchParams.set('checkin',arrival);url.searchParams.set('checkout',departure);url.searchParams.set('group_adults',guests);url.searchParams.set('no_rooms','1');}
  if(provider==='airbnb'){url.searchParams.set('check_in',arrival);url.searchParams.set('check_out',departure);url.searchParams.set('adults',guests);}
  if(provider==='agoda'){url.searchParams.set('checkIn',arrival);url.searchParams.set('checkOut',departure);url.searchParams.set('adults',guests);url.searchParams.set('rooms','1');}
 }
 return url.href;
}
function refreshChannels(arrival=quick?.elements?.checkin?.value||'',departure=quick?.elements?.checkout?.value||'',guests=quick?.elements?.guests?.value||'2'){$('[data-channel]').forEach(a=>a.href=channelHref(a.dataset.channel,arrival,departure,guests));}
window.addEventListener('staydateschange',()=>{const f=booking?.open?form:quick;if(f?.elements)refreshChannels(f.elements.checkin.value,f.elements.checkout.value,f.elements.guests.value)});if(booking)booking.addEventListener('close',()=>refreshChannels());
$$('[data-book]').forEach(b=>b.addEventListener('click',()=>refreshChannels(form?.elements?.checkin?.value||'',form?.elements?.checkout?.value||'',form?.elements?.guests?.value||'2')));
refreshChannels();
if($('#stay-calendar')){
 const today=localDate(),base=new Date(today+'T12:00:00'),months=$('#calendar-months'),status=$('#calendar-status');
 let monthOffset=0,start='',end='';
 let blockedDates=new Set(),bookedRanges=[],isSyncing=false;
 const shortDate=v=>new Date(v+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});

 async function fetchAvailability(vName){
  isSyncing=true;
  if(status)status.textContent=`Syncing live calendar with Booking.com, Agoda & Airbnb for Villa ${vName}…`;
  try{
   const res=await fetch(`/api/calendar/availability?villa=${encodeURIComponent(vName)}`);
   if(res.ok){
    const d=await res.json();
    blockedDates=new Set(d.blockedDates||[]);
    bookedRanges=d.bookedRanges||[];
   }
  }catch(err){console.warn('Sync fetch error:',err)}
  finally{isSyncing=false;renderCalendar();}
 }

 function hasOverlap(a,b){
  try{
   const cur=new Date(a+'T12:00:00Z'),stop=new Date(b+'T12:00:00Z');
   while(cur<stop){
    if(blockedDates.has(cur.toISOString().slice(0,10)))return true;
    cur.setUTCDate(cur.getUTCDate()+1);
   }
  }catch(e){}
  return false;
 }

 function monthMarkup(offset){
  const date=new Date(base.getFullYear(),base.getMonth()+offset,1),year=date.getFullYear(),month=date.getMonth(),count=new Date(year,month+1,0).getDate(),leading=(date.getDay()+6)%7;
  const name=date.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  let days=Array.from({length:leading},()=>'<span class="cal-empty" aria-hidden="true"></span>').join('');
  for(let n=1;n<=count;n++){
   const value=localDate(new Date(year,month,n));
   const past=value<today;
   const isBooked=blockedDates.has(value);
   const endpoint=value===start||value===end;
   const inRange=start&&end&&value>start&&value<end;
   const rangeInfo=isBooked?bookedRanges.find(r=>r.start<=value&&value<r.end):null;
   const srcLabel=rangeInfo?rangeInfo.source:'Reserved';
   const titleTxt=isBooked?`Reserved via ${srcLabel}`:shortDate(value);
   const ariaTxt=isBooked?`${shortDate(value)} (Reserved via ${srcLabel})`:`${shortDate(value)}${value===start?', check-in':value===end?', check-out':''}`;

   days+=`<button type="button" data-date="${value}" class="cal-day${isBooked?' booked':''}${endpoint?' chosen':''}${inRange?' in-range':''}${value===today?' today':''}" ${(past||isBooked)?'disabled':''} title="${titleTxt}" aria-label="${ariaTxt}" aria-pressed="${endpoint}" ${value===today?'aria-current="date"':''}>${n}</button>`;
  }
  return `<div class="cal-month" role="group" aria-label="${name}"><h3>${name}</h3><div class="cal-week" aria-hidden="true"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><div class="cal-days">${days}</div></div>`;
 }

 function syncCalendar(){
  $('#cal-in').textContent=start?shortDate(start):'Select arrival';$('#cal-out').textContent=end?shortDate(end):'Select departure';
  if(start&&end){
   let n=Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000),villa=$('#calendar-villa').value;
   status.textContent=`${n} night${n===1?'':'s'} · Villa ${villa} · Available for your stay (Live synced).`;
   quick.elements.villa.value=villa;quick.elements.checkin.value=start;quick.elements.checkout.value=end;quick.elements.guests.value=$('#calendar-guests').value;
   syncDates(quick);refreshChannels(start,end,$('#calendar-guests').value);
  }else if(!isSyncing){
   status.textContent=start?'Now choose your check-out date.':'Choose your check-in date, then your check-out date (Live synced with Booking.com, Agoda & Airbnb).';
   refreshChannels('','',$('#calendar-guests').value);
  }
 }

 function renderCalendar(){
  months.innerHTML=monthMarkup(monthOffset)+monthMarkup(monthOffset+1);
  $('#cal-prev').disabled=monthOffset===0;
  $('#cal-next').disabled=monthOffset>=17;
  syncCalendar();
 }

 months.addEventListener('click',e=>{
  const b=e.target.closest('[data-date]');
  if(!b||b.disabled)return;
  const v=b.dataset.date;
  if(blockedDates.has(v)){
   status.textContent=`${shortDate(v)} is already reserved on Booking.com/Agoda/Airbnb.`;
   return;
  }
  if(!start||end||v<=start){
   start=v;end='';
  }else{
   if(hasOverlap(start,v)){
    status.textContent='The selected dates include an existing OTA reservation. Please pick available dates.';
    return;
   }
   end=v;
  }
  renderCalendar();
  const selected=months.querySelector(`[data-date="${v}"]`);
  selected?.focus({preventScroll:true});
 });

 $('#cal-prev').addEventListener('click',()=>{if(monthOffset>0){monthOffset--;renderCalendar();}});
 $('#cal-next').addEventListener('click',()=>{if(monthOffset<17){monthOffset++;renderCalendar();}});
 $('#cal-clear').addEventListener('click',()=>{start='';end='';quick.elements.checkin.value='';quick.elements.checkout.value='';syncDates(quick);renderCalendar();});
 $('#calendar-guests').addEventListener('change',()=>{quick.elements.guests.value=$('#calendar-guests').value;syncCalendar();});
 $('#calendar-villa').addEventListener('change',()=>{
  const v=$('#calendar-villa').value;
  quick.elements.villa.value=v;
  start='';end='';
  fetchAvailability(v);
 });
 $('#calendar-enquire').addEventListener('click',()=>{
  if(!start||!end){
   status.textContent='Please select both check-in and check-out dates first.';
   months.querySelector('[data-date]:not([disabled])')?.focus();
   return;
  }
  openBooking({villa:$('#calendar-villa').value,checkin:start,checkout:end,guests:$('#calendar-guests').value});
  refreshChannels(start,end,$('#calendar-guests').value);
 });
 quick.addEventListener('change',()=>{
  const a=quick.elements.checkin.value,b=quick.elements.checkout.value;
  $('#calendar-villa').value=quick.elements.villa.value;
  if(a>=today&&b>a&&!hasOverlap(a,b)){
   start=a;end=b;
   $('#calendar-guests').value=quick.elements.guests.value;
   renderCalendar();
  }
 });

 renderCalendar();
 fetchAvailability($('#calendar-villa').value);
}



// ==========================================
// TRANQUIL TERRACE LUXURY NAVIGATION CONTROLLER
// Handles Centered Logo Header, Drawer, Scroll Compaction & Currency
// ==========================================
(function() {
  function initLuxuryNav() {
    if (window.__luxuryNavInitialized) return;
    window.__luxuryNavInitialized = true;
    const burger = document.getElementById("luxury-burger-btn") || document.querySelector(".luxury-burger-btn");
    const drawer = document.getElementById("luxury-mobile-drawer") || document.querySelector(".luxury-mobile-drawer");
    const closeBtn = document.getElementById("luxury-drawer-close") || document.querySelector(".drawer-close-btn");
    const header = document.getElementById("site-header") || document.querySelector("header.taru-header");

    function openDrawer() {
      if (!drawer) return;
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      if (burger) {
        burger.classList.add("is-active");
        burger.setAttribute("aria-expanded", "true");
      }
      document.body.classList.add("luxury-drawer-open");
      document.documentElement.classList.add("luxury-drawer-open");
      if (closeBtn) closeBtn.focus();
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      if (burger) {
        burger.classList.remove("is-active");
        burger.setAttribute("aria-expanded", "false");
        burger.focus();
      }
      document.body.classList.remove("luxury-drawer-open");
      document.documentElement.classList.remove("luxury-drawer-open");
    }

    if (burger) {
      burger.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (drawer && drawer.classList.contains("is-open")) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function(e) {
        e.preventDefault();
        closeDrawer();
      });
    }

    // Close on link click inside drawer
    if (drawer) {
      drawer.querySelectorAll(".drawer-nav-link, .drawer-book-cta, .drawer-contact-tel, .drawer-contact-wa").forEach(function(link) {
        link.addEventListener("click", function() {
          closeDrawer();
        });
      });

      // Close on backdrop click
      drawer.addEventListener("click", function(e) {
        if (e.target === drawer) {
          closeDrawer();
        }
      });
    }

    // Escape key listener
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) {
        closeDrawer();
      }
    });

    // Scroll compaction listener (> 50px)
    let lastScrollY = window.scrollY;
    let scrollTicking = false;
    function handleScroll() {
      const y = window.scrollY;
      if (header) {
        const shouldCompact = y > 50;
        header.classList.toggle("compact", shouldCompact);
        header.classList.toggle("scrolled", shouldCompact);
      }
      scrollTicking = false;
    }

    window.addEventListener("scroll", function() {
      if (!scrollTicking) {
        window.requestAnimationFrame(handleScroll);
        scrollTicking = true;
      }
    }, { passive: true });
    handleScroll();

    // Currency toggle handling
    document.querySelectorAll(".luxury-currency-toggle, .currency-toggle").forEach(function(toggle) {
      toggle.querySelectorAll(".luxury-curr-btn, button[data-curr]").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          e.preventDefault();
          const curr = this.dataset.curr;
          if (curr) {
            document.querySelectorAll("[data-curr]").forEach(function(b) {
              const active = b.dataset.curr === curr;
              b.classList.toggle("active", active);
              b.setAttribute("aria-pressed", active ? "true" : "false");
            });
            if (typeof window.updateMetaCurrency === "function") {
              window.updateMetaCurrency(curr);
            }
          }
        });
      });
    });

    // Booking buttons smooth scroll / modal handler
    document.querySelectorAll(".luxury-book-link, .luxury-mobile-book-btn, .drawer-book-cta").forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        const bookingCard = document.getElementById("booking-card");
        if (bookingCard) {
          e.preventDefault();
          bookingCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLuxuryNav);
  } else {
    initLuxuryNav();
  }
})();


// Tranquil Terrace Footer Reveal & Copyright Observer
(function() {
  function initFooterReveal() {
    const items = document.querySelectorAll('.tt-reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('tt-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('tt-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    items.forEach(el => observer.observe(el));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterReveal);
  } else {
    initFooterReveal();
  }
})();
