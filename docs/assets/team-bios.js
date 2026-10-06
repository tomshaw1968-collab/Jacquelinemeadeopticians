window.JM_TEAM={"jacqueline meade": {"name": "Jacqueline Meade", "first": "Jacqueline", "letters": "MCOptom DipTp(IP)", "role": "Founder, Owner &amp; Optometrist", "img": "/images/team-jacqueline-meade.webp", "bio": ["Jacqueline qualified in Optometry from Glasgow Caledonian University in 1989 and opened the practice on Bank Street in 1991. With more than 35 years in eyecare, she is an Independent Prescriber and holds the NES glaucoma qualification (NESGAT), so many eye conditions can be diagnosed, treated and monitored right here in the practice. She also holds a Certificate in Myopia Management, and has a particular interest in frame styling and low vision.", "What Jacqueline loves most is caring for the local community, often looking after generations of the same family. She believes up-to-date equipment makes every examination more thorough, and she enjoys working with colleagues who encourage each other to keep learning.", "As you'd expect, her own eyewear collection is varied: from fashion houses such as Prada, Tom Ford, Marciano and Max Mara to smaller independent labels like WOOW, Coco Song, Cocoa Mint and Lamarca. Outside the practice she loves time with her family, and keeps active swimming, cycling and running. She also speaks Spanish.", "“Our patients make me smile every day: they're so grateful for their eye examination and delighted with their new glasses.”"], "url": "/about/#jacqueline-meade"}, "chris lynch": {"name": "Chris Lynch", "first": "Chris", "letters": "BSc (Hons) DipTp(IP)", "role": "Optometrist &amp; Independent Prescriber", "img": "/images/team-chris-lynch.webp", "bio": ["Chris graduated in Optometry from Glasgow Caledonian University in 2012 and qualified as an Independent Prescriber in 2016, so he can diagnose and treat many eye conditions right here in the practice. With more than 15 years in eyecare, he has a particular interest in emergency eyecare and OCT retinal imaging, and has mentored pre-registration optometrists.", "What Chris enjoys most is helping patients understand their eyes, especially when someone tells him a problem they've lived with for years, or one that used to mean a trip to the hospital, has finally been sorted. Away from the practice, you'll find him out walking his golden retriever, usually with a good coffee in hand."], "url": "/about/#chris-lynch"}, "morven pollock": {"name": "Morven Pollock", "first": "Morven", "letters": "FBDO", "role": "Dispensing Optician", "img": "/images/team-morven-pollock.webp", "bio": ["Morven has worked in eyecare for 15 years and qualified as a Dispensing Optician through ABDO College in 2017. She's the person to see for varifocals and lens advice, frame styling, children's eyewear and ZEISS MyoCare myopia management, and she has a special interest in low vision.", "Morven loves helping patients choose lenses that make everyday life easier, and seeing their confidence lift when they collect their new glasses. “Our close team feels like a family. It's a joy to be part of it.” Her own frame taste is anything a bit different, ideally in a bold colour. Outside work she's out and about with her young son, walking, enjoying a coffee or getting cosy at home."], "url": "/about/#morven-pollock"}};
/* Adds "Meet <name>" buttons beside clinicians' names in the Xeyex booking widget,
   opening a pop-up bio so patients never lose their place in the booking. */
(function () {
  var TEAM = window.JM_TEAM || {};
  var dlg;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  function dialog() {
    if (dlg) return dlg;
    dlg = el('dialog', 'jm-bio');
    dlg.setAttribute('aria-labelledby', 'jm-bio-name');
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    document.body.appendChild(dlg);
    return dlg;
  }

  function open(p) {
    var d = dialog(); d.textContent = '';
    var wrap = el('div', 'jm-bio-inner');
    var img = el('img', 'jm-bio-photo'); img.src = p.img; img.alt = p.name;
    var body = el('div', 'jm-bio-body');
    body.appendChild(el('span', 'label', p.role.replace(/&amp;/g, '&')));
    var h = el('h3', null, p.name); h.id = 'jm-bio-name';
    h.appendChild(el('small', null, p.letters)); body.appendChild(h);
    p.bio.forEach(function (t) { body.appendChild(el('p', null, t)); });
    var actions = el('div', 'jm-bio-actions');
    var back = el('button', 'btn dark', 'Back to booking'); back.type = 'button';
    back.addEventListener('click', function () { d.close(); });
    var more = el('a', 'link', 'Meet the whole team'); more.href = p.url; more.target = '_blank'; more.rel = 'noopener';
    actions.appendChild(back); actions.appendChild(more); body.appendChild(actions);
    var x = el('button', 'jm-bio-close', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close');
    x.addEventListener('click', function () { d.close(); });
    wrap.appendChild(img); wrap.appendChild(body);
    d.appendChild(x); d.appendChild(wrap);
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    x.focus({ preventScroll: true }); d.scrollTop = 0;
  }

  function decorate(root) {
    var names = (root || document).querySelectorAll('.xeyexHeaderPerson:not([data-jm-bio])');
    for (var i = 0; i < names.length; i++) {
      var n = names[i]; n.setAttribute('data-jm-bio', '');
      var p = TEAM[(n.textContent || '').trim().toLowerCase()];
      if (!p) continue;
      var b = el('button', 'jm-bio-btn'); b.type = 'button';
      var im = el('img'); im.src = p.img; im.alt = ''; im.width = 26; im.height = 26; b.appendChild(im);
      b.appendChild(document.createTextNode('Meet ' + p.first));
      b.addEventListener('click', (function (pp) { return function (e) { e.preventDefault(); e.stopPropagation(); open(pp); }; })(p));
      n.appendChild(b);
    }
  }

  // Highlight the Enhanced Sight Test on the appointment-type step
  function recommend(root) {
    var types = root.querySelectorAll('.xeyexApptType:not([data-jm-rec])');
    for (var i = 0; i < types.length; i++) {
      var t = types[i]; t.setAttribute('data-jm-rec', '');
      var btn = t.querySelector('button');
      if (!btn || !/enhanced/i.test(btn.textContent || '')) continue;
      t.classList.add('jm-rec');
      t.insertBefore(el('span', 'jm-rec-badge', 'Recommended by Jacqueline'), t.firstChild);
      var ul = el('ul', 'jm-rec-list');
      ['Everything in the NHS eye examination', 'optomap\u00ae image of around 82% of your retina', '3D OCT scan beneath the surface of the eye', 'See your own images on screen', 'A record to compare at every future visit']
        .forEach(function (x) { ul.appendChild(el('li', null, x)); });
      t.appendChild(ul);
      var more = el('p', 'jm-rec-more', '\u00a335 for adults, in addition to your free NHS examination. ');
      var a = el('a', null, 'Why it matters'); a.href = '#why-enhanced'; more.appendChild(a);
      t.appendChild(more);
    }
  }

  function start() {
    var w = document.getElementById('xf022e232b663451');
    if (!w) return;
    decorate(w); recommend(w);
    new MutationObserver(function () { decorate(w); recommend(w); }).observe(w, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
