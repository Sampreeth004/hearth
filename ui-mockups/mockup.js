/* eslint-disable */
/**
 * Hearth UI mockups.
 *
 * Renders each app view with the exact Tailwind class strings used by the
 * React components, then hands off to headless Chrome for screenshots.
 * Select a view with ?view=<name>. Data below is representative sample data.
 */
(function () {
  "use strict";

  var ICON = function (name, cls) {
    return '<i data-lucide="' + name + '" class="' + (cls || "") + '"></i>';
  };

  var TAB_TITLES = {
    chats: "Messages",
    friends: "Friends",
    search: "Search",
    profile: "Profile",
  };

  function getInitials(name) {
    if (!name) return "?";
    return name
      .trim()
      .split(/\s+/)
      .map(function (n) {
        return n[0];
      })
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  var SIZES = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-20 h-20 text-2xl",
  };
  var DOTS = {
    sm: "w-2.5 h-2.5 border",
    md: "w-3 h-3 border-2",
    lg: "w-3.5 h-3.5 border-2",
    xl: "w-5 h-5 border-2",
  };

  function avatar(name, opts) {
    opts = opts || {};
    var size = opts.size || "md";
    var online = opts.online === undefined ? null : opts.online;
    var dot =
      online === null
        ? ""
        : '<span class="absolute bottom-0 right-0 rounded-full border-white ' +
          DOTS[size] +
          " " +
          (online ? "animate-presence bg-emerald-500" : "bg-stone-400") +
          '"></span>';
    return (
      '<div class="relative inline-flex shrink-0 ' +
      (opts.className || "") +
      '">' +
      '<div class="rounded-full bg-ember-strong flex items-center justify-center font-semibold text-white ' +
      SIZES[size] +
      '">' +
      getInitials(name) +
      "</div>" +
      dot +
      "</div>"
    );
  }

  function photo(label, a, b) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="520" height="360">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' +
      a +
      '"/><stop offset="1" stop-color="' +
      b +
      '"/></linearGradient></defs>' +
      '<rect width="520" height="360" fill="url(#g)"/>' +
      '<circle cx="400" cy="96" r="46" fill="rgba(255,255,255,0.55)"/>' +
      '<path d="M0 300 L160 170 L270 260 L370 180 L520 310 L520 360 L0 360 Z" fill="rgba(0,0,0,0.18)"/>' +
      '<path d="M0 330 L120 250 L230 320 L330 250 L520 340 L520 360 L0 360 Z" fill="rgba(0,0,0,0.22)"/>' +
      '<text x="28" y="52" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="rgba(255,255,255,0.92)">' +
      label +
      "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function gifTile(label, a, b) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' +
      a +
      '"/><stop offset="1" stop-color="' +
      b +
      '"/></linearGradient></defs>' +
      '<rect width="320" height="240" fill="url(#g)"/>' +
      '<circle cx="160" cy="112" r="46" fill="rgba(255,255,255,0.75)"/>' +
      '<path d="M150 86 L196 112 L150 138 Z" fill="rgba(0,0,0,0.45)"/>' +
      '<text x="16" y="222" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="rgba(255,255,255,0.95)">' +
      label +
      "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ------------------------------- data ------------------------------- */

  var me = {
    name: "Sam Carter",
    username: "samcarter",
    email: "sam@example.com",
    bio: "Coffee, code, and campfires.",
    online: true,
  };

  var maya = { name: "Maya Chen", username: "mayachen", online: true };
  var liam = { name: "Liam Patel", username: "liampatel", online: false };
  var ava = { name: "Ava Brooks", username: "avabrooks", online: true };
  var noah = { name: "Noah Kim", username: "noahkim", online: false };
  var priya = { name: "Priya Sharma", username: "priyasharma", online: true };

  var conversations = [
    { name: "Maya Chen", online: true, last: "See you at 7 then?", own: false, time: "10:26 AM", unread: 2 },
    { name: "Ava Brooks", online: true, last: "Haha that GIF is perfect", own: false, time: "9:12 AM", unread: 0 },
    { name: "Liam Patel", online: false, last: "Pushed the fix \uD83C\uDF89", own: true, time: "8:40 AM", unread: 0 },
    { name: "Noah Kim", online: false, last: "Happy birthday! \uD83C\uDF82", own: true, time: "Yesterday", unread: 0 },
    { name: "Priya Sharma", online: true, last: "The photos look amazing", own: false, time: "Mon", unread: 0 },
    { name: "Elena Rossi", online: false, last: "Let's catch up soon", own: false, time: "Feb 12", unread: 0 },
  ];

  var friends = [maya, liam, ava, noah, priya];

  var searchResults = [
    { user: { name: "Maya Chen", username: "mayachen", online: true }, status: "friends" },
    { user: { name: "Owen Wright", username: "owenwright", online: false }, status: "none" },
    { user: { name: "Sofia Almeida", username: "sofiaalmeida", online: true }, status: "requested" },
    { user: { name: "Diego Moreno", username: "diegomoreno", online: true }, status: "incoming" },
    { user: { name: "Hana Sato", username: "hanasato", online: false }, status: "none" },
  ];

  /* ---------------------------- small pieces ---------------------------- */

  function typingDots() {
    return (
      '<span class="inline-flex items-center gap-1">' +
      '<span class="typing-dot h-1.5 w-1.5 rounded-full bg-amber-500"></span>' +
      '<span class="typing-dot h-1.5 w-1.5 rounded-full bg-amber-500"></span>' +
      '<span class="typing-dot h-1.5 w-1.5 rounded-full bg-amber-500"></span></span>'
    );
  }

  function brandMark(extraClass) {
    return (
      '<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 ' +
      (extraClass || "") +
      '">' +
      ICON("flame", "h-4 w-4 text-amber-400") +
      "</span>"
    );
  }

  function badge(text) {
    return (
      '<span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-semibold text-white">' +
      text +
      "</span>"
    );
  }

  /* ------------------------------- sidebar ------------------------------- */

  function sidebar(activeTab, unread, requests) {
    var items = [
      { id: "chats", icon: "message-circle", label: "Chats", count: unread },
      { id: "friends", icon: "users", label: "Friends", count: requests },
      { id: "search", icon: "search", label: "Search", count: 0 },
    ];
    var nav = items
      .map(function (item) {
        var active = activeTab === item.id;
        return (
          '<button type="button" class="relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ' +
          (active
            ? "bg-amber-50 text-orange-800"
            : "text-stone-600 hover:bg-stone-100") +
          '">' +
          '<span class="absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r-full bg-ember transition-all duration-200 ' +
          (active ? "h-5 opacity-100" : "h-0 opacity-0") +
          '"></span>' +
          ICON(item.icon, "h-5 w-5 " + (active ? "scale-110" : "")) +
          item.label +
          (item.count > 0
            ? '<span class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full ' +
              (item.id === "friends" ? "bg-rose-500" : "bg-rose-600") +
              ' px-1.5 text-[10px] font-semibold text-white">' +
              (item.count > 9 ? "9+" : item.count) +
              "</span>"
            : "") +
          "</button>"
        );
      })
      .join("");

    return (
      '<aside class="hidden w-64 flex-col border-r border-stone-200 bg-white lg:flex">' +
      '<div class="flex items-center gap-2 border-b border-stone-200 px-4 py-3.5">' +
      brandMark() +
      '<span class="text-base font-bold tracking-tight text-stone-900">Hearth</span>' +
      "</div>" +
      '<div class="flex items-center gap-3 border-b border-stone-200 px-4 py-3.5">' +
      avatar(me.name, { size: "md", online: true }) +
      '<div class="min-w-0 flex-1">' +
      '<h2 class="truncate text-sm font-semibold text-stone-900">' +
      me.name +
      "</h2>" +
      '<p class="truncate text-xs text-stone-500">@' +
      me.username +
      "</p>" +
      "</div>" +
      "</div>" +
      '<nav class="flex-1 space-y-1 p-2" aria-label="Main navigation">' +
      nav +
      "</nav>" +
      '<div class="border-t border-stone-200 p-2">' +
      '<button type="button" class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100">' +
      ICON("log-out", "h-5 w-5") +
      "Sign Out</button>" +
      "</div>" +
      "</aside>"
    );
  }

  /* --------------------------- mobile chrome --------------------------- */

  function mobileHeader(activeTab) {
    var actions = "";
    if (activeTab !== "search") {
      actions +=
        '<button type="button" class="rounded-lg p-2 text-stone-500">' +
        ICON("search", "h-5 w-5") +
        "</button>";
    }
    if (activeTab !== "profile") {
      actions +=
        '<button type="button" class="rounded-full">' +
        avatar(me.name, { size: "sm", online: true }) +
        "</button>";
    }
    return (
      '<header class="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">' +
      '<div class="flex items-center gap-2.5">' +
      brandMark() +
      '<h1 class="text-base font-bold tracking-tight text-stone-900">' +
      TAB_TITLES[activeTab] +
      "</h1>" +
      "</div>" +
      '<div class="flex items-center gap-1">' +
      actions +
      "</div>" +
      "</header>"
    );
  }

  function mobileNav(activeTab, unread, requests) {
    var tabs = [
      { id: "chats", icon: "message-circle", label: "Chats", badge: unread },
      { id: "friends", icon: "users", label: "Friends", badge: requests },
      { id: "search", icon: "search", label: "Search", badge: 0 },
      { id: "profile", icon: "user", label: "Profile", badge: 0 },
    ];
    return (
      '<nav aria-label="Main navigation" class="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">' +
      '<div class="flex items-center justify-around">' +
      tabs
        .map(function (tab) {
          var active = activeTab === tab.id;
          return (
            '<button type="button" class="relative flex min-w-[56px] flex-1 flex-col items-center gap-0.5 px-1 py-2 transition-colors duration-150 ' +
            (active ? "text-orange-800" : "text-stone-500") +
            '">' +
            (active
              ? '<span class="animate-pop-in absolute -top-0.5 h-1 w-10 rounded-full bg-ember"></span>'
              : "") +
            '<span class="relative">' +
            ICON(tab.icon, "h-5 w-5 " + (active ? "-translate-y-0.5 scale-110" : "")) +
            (tab.badge > 0
              ? '<span class="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-semibold text-white">' +
                (tab.badge > 9 ? "9+" : tab.badge) +
                "</span>"
              : "") +
            "</span>" +
            '<span class="text-[10px] ' +
            (active ? "font-semibold" : "font-medium") +
            '">' +
            tab.label +
            "</span>" +
            "</button>"
          );
        })
        .join("") +
      "</div></nav>"
    );
  }

  /* ----------------------------- conversations ----------------------------- */

  function conversationItem(c, active) {
    var unread = c.unread || 0;
    var preview = (c.own ? "You: " : "") + c.last;
    return (
      '<button type="button" class="group relative flex w-full items-center gap-3 px-4 py-3 text-left transition-all duration-150 ' +
      (active ? "bg-amber-50" : "hover:bg-stone-50") +
      '">' +
      '<span class="absolute left-0 top-1/2 h-0 w-1 -translate-y-1/2 rounded-r-full bg-ember transition-all duration-200 ' +
      (active ? "h-8 opacity-100" : "opacity-0") +
      '"></span>' +
      avatar(c.name, {
        size: "md",
        online: c.online,
        className: "transition-transform duration-150 group-hover:scale-105",
      }) +
      '<div class="min-w-0 flex-1">' +
      '<div class="flex items-center justify-between gap-2">' +
      '<h3 class="truncate text-sm text-stone-900 ' +
      (unread > 0 ? "font-semibold" : "font-medium") +
      '">' +
      c.name +
      "</h3>" +
      '<span class="shrink-0 text-xs ' +
      (unread > 0 ? "font-semibold text-orange-700" : "text-stone-500") +
      '">' +
      c.time +
      "</span>" +
      "</div>" +
      '<div class="mt-0.5 flex items-center justify-between gap-2">' +
      '<p class="truncate text-xs ' +
      (unread > 0 ? "font-medium text-stone-700" : "text-stone-500") +
      '">' +
      preview +
      "</p>" +
      (unread > 0
        ? '<span class="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-semibold text-white shadow-sm shadow-rose-600/40">' +
          (unread > 9 ? "9+" : unread) +
          "</span>"
        : "") +
      "</div>" +
      "</div>" +
      "</button>"
    );
  }

  function conversationList(activeIndex) {
    return (
      '<div class="divide-y divide-stone-100">' +
      conversations
        .map(function (c, i) {
          return conversationItem(c, i === activeIndex);
        })
        .join("") +
      "</div>"
    );
  }

  /* -------------------------------- chat -------------------------------- */

  function chatHeader(user, typing) {
    var status = typing
      ? '<span class="flex items-center gap-1.5 text-xs font-medium text-amber-600">typing' +
        typingDots() +
        "</span>"
      : '<p class="text-xs ' +
        (user.online ? "text-emerald-600" : "text-stone-500") +
        '">' +
        (user.online ? "Online" : "Last seen 2 hr ago") +
        "</p>";
    return (
      '<header class="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">' +
      '<button type="button" class="-ml-1 rounded-lg p-1.5 text-stone-600 lg:hidden">' +
      ICON("arrow-left", "h-5 w-5") +
      "</button>" +
      '<button type="button" class="-m-1 flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left">' +
      avatar(user.name, { size: "md", online: user.online }) +
      '<div class="min-w-0 flex-1">' +
      '<h2 class="truncate text-sm font-semibold text-stone-900">' +
      user.name +
      "</h2>" +
      status +
      "</div>" +
      "</button>" +
      "</header>"
    );
  }

  function bubble(o) {
    var own = o.side === "own";
    var isMedia = !!o.media;
    var outer =
      '<div class="group relative flex ' +
      (own
        ? "animate-bubble-in-right justify-end"
        : "animate-bubble-in-left justify-start") +
      " " +
      (o.groupEnd === false ? "mb-0.5" : "mb-2.5") +
      '">';
    var inner =
      '<div class="relative max-w-[80%] rounded-2xl transition-[box-shadow] duration-150 sm:max-w-[70%] ' +
      (isMedia ? "p-1.5" : "px-3.5 py-2") +
      " " +
      (own
        ? "bg-ember text-stone-900 shadow-md shadow-orange-500/25"
        : "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/70") +
      " " +
      (own ? "rounded-br-md" : "rounded-bl-md") +
      '">';

    if (o.reply) {
      inner +=
        '<button type="button" class="mb-1.5 block w-full rounded-lg border-l-2 px-2 py-1 text-left ' +
        (own ? "border-amber-950/40 bg-black/10" : "border-amber-500 bg-stone-100") +
        '">' +
        '<span class="block text-[10px] font-semibold ' +
        (own ? "text-amber-950/80" : "text-orange-700") +
        '">' +
        o.reply.senderName +
        "</span>" +
        '<span class="line-clamp-2 block text-[11px] ' +
        (own ? "text-amber-950/70" : "text-stone-500") +
        '">' +
        o.reply.preview +
        "</span></button>";
    }

    if (isMedia) {
      if (o.mediaType === "image") {
        inner +=
          '<div class="block overflow-hidden rounded-xl"><img src="' +
          o.media +
          '" alt="Photo" class="max-h-64 w-auto max-w-full object-cover"></div>';
      } else {
        inner +=
          '<img src="' +
          o.media +
          '" alt="GIF" class="max-h-64 w-auto max-w-full rounded-xl">';
      }
    } else {
      inner +=
        '<p class="whitespace-pre-wrap break-words text-sm leading-relaxed">' +
        o.text +
        "</p>";
    }

    if (o.reactions && o.reactions.length) {
      inner +=
        '<div class="mt-1 flex flex-wrap gap-1 ' +
        (own ? "justify-end" : "justify-start") +
        '">' +
        o.reactions
          .map(function (r) {
            return (
              '<span class="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] ' +
              (r.mine ? "ring-1 ring-amber-500/70 " : "") +
              (own ? "bg-black/10" : "bg-stone-100") +
              '"><span>' +
              r.emoji +
              "</span>" +
              (r.count > 1
                ? '<span class="text-[9px] font-semibold">' + r.count + "</span>"
                : "") +
              "</span>"
            );
          })
          .join("") +
        "</div>";
    }

    if (o.groupEnd !== false) {
      inner +=
        '<div class="flex items-center gap-1 ' +
        (isMedia ? "mt-1 px-1 pb-0.5" : "mt-0.5") +
        " " +
        (own ? "justify-end" : "justify-start") +
        '">' +
        '<span class="text-[10px] tabular-nums ' +
        (own ? "font-medium text-amber-950/70" : "text-stone-400") +
        '">' +
        o.time +
        "</span>" +
        (own
          ? o.read
            ? ICON("check-check", "h-3 w-3 text-amber-950/80")
            : ICON("check", "h-3 w-3 text-amber-950/70")
          : "") +
        "</div>";
    }

    return outer + inner + "</div></div>";
  }

  function typingBubble() {
    return (
      '<div class="animate-bubble-in-left mb-2.5 flex justify-start">' +
      '<div role="status" class="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 shadow-sm ring-1 ring-stone-200/70">' +
      '<span class="typing-dot h-2 w-2 rounded-full bg-stone-400"></span>' +
      '<span class="typing-dot h-2 w-2 rounded-full bg-stone-400"></span>' +
      '<span class="typing-dot h-2 w-2 rounded-full bg-amber-500"></span>' +
      "</div></div>"
    );
  }

  function messageList() {
    var sep =
      '<div class="animate-fade-in my-3 flex items-center gap-3">' +
      '<div class="h-px flex-1 bg-stone-200/80"></div>' +
      '<span class="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-400 backdrop-blur">Today</span>' +
      '<div class="h-px flex-1 bg-stone-200/80"></div>' +
      "</div>";

    var msgs = [
      bubble({ side: "in", text: "Hey! Are we still on for tonight?", time: "10:18 AM", groupEnd: false }),
      bubble({ side: "in", text: "I found this little ramen place near the park \uD83C\uDF5C", time: "10:18 AM", groupEnd: true }),
      bubble({ side: "own", text: "Yes! I'm in. What time?", time: "10:20 AM", groupEnd: false }),
      bubble({ side: "own", text: "I can be there by 7", time: "10:20 AM", read: true, groupEnd: true }),
      bubble({
        side: "in",
        reply: { senderName: "You", preview: "I can be there by 7" },
        text: "Perfect, I'll book a table for two \uD83C\uDF89",
        time: "10:22 AM",
        groupEnd: true,
      }),
      bubble({
        side: "own",
        media: photo("Ramen night", "#fbbf24", "#f97316"),
        mediaType: "image",
        time: "10:24 AM",
        read: true,
        groupEnd: true,
        reactions: [{ emoji: "\uD83D\uDD25", count: 1, mine: false }],
      }),
      bubble({
        side: "in",
        media: gifTile("GIF", "#38bdf8", "#6366f1"),
        mediaType: "gif",
        time: "10:25 AM",
        groupEnd: true,
        reactions: [{ emoji: "\uD83D\uDE02", count: 2, mine: false }],
      }),
      bubble({
        side: "in",
        text: "This one made me think of you \uD83D\uDE02",
        time: "10:26 AM",
        groupEnd: true,
        reactions: [{ emoji: "\u2764\uFE0F", count: 2, mine: true }],
      }),
    ].join("");

    return (
      '<div class="relative min-h-0 flex-1">' +
      '<div class="chat-wallpaper h-full overflow-y-auto px-4 py-4">' +
      sep +
      msgs +
      typingBubble() +
      "</div></div>"
    );
  }

  function gifPicker() {
    var tiles = [
      gifTile("WAVE", "#f472b6", "#a855f7"),
      gifTile("LOL", "#fbbf24", "#f97316"),
      gifTile("HEART", "#fb7185", "#e11d48"),
      gifTile("YES", "#34d399", "#059669"),
      gifTile("PARTY", "#60a5fa", "#4f46e5"),
      gifTile("HI", "#facc15", "#f59e0b"),
    ]
      .map(function (g) {
        return (
          '<button type="button" class="group relative overflow-hidden rounded-lg bg-stone-100 transition-opacity hover:opacity-90">' +
          '<img src="' +
          g +
          '" class="h-24 w-full object-cover"></button>'
        );
      })
      .join("");

    return (
      '<div role="dialog" aria-label="Choose a GIF" class="animate-pop-in absolute bottom-full left-2 right-2 z-40 mb-2 flex max-h-[60vh] origin-bottom flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl sm:left-auto sm:w-[22rem]">' +
      '<div class="flex items-center gap-2 border-b border-stone-200 p-3">' +
      '<div class="relative flex-1">' +
      ICON("search", "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400") +
      '<input type="search" placeholder="Search GIFs..." class="w-full rounded-lg border border-stone-300 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-900 placeholder-stone-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500">' +
      "</div>" +
      '<button type="button" class="rounded-lg p-1.5 text-stone-500">' +
      ICON("x", "h-4 w-4") +
      "</button>" +
      "</div>" +
      '<div class="min-h-0 flex-1 overflow-y-auto">' +
      '<div class="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">' +
      tiles +
      "</div>" +
      '<p class="px-3 pb-2 pt-1 text-center text-[10px] text-stone-400">Powered by GIPHY</p>' +
      "</div>" +
      '<div class="border-t border-stone-200 p-3">' +
      '<div class="flex items-center gap-2">' +
      '<div class="relative flex-1">' +
      ICON("link-2", "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400") +
      '<input type="url" placeholder="Paste a GIF link" class="w-full rounded-lg border border-stone-300 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-900 placeholder-stone-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500">' +
      "</div>" +
      '<button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg bg-ember px-3 py-1.5 text-sm font-semibold text-stone-900 opacity-50 shadow-sm shadow-orange-500/30">Send</button>' +
      "</div></div></div>"
    );
  }

  function messageInput(gifOpen) {
    return (
      '<div class="relative bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">' +
      (gifOpen ? gifPicker() : "") +
      '<div class="flex items-end gap-2">' +
      '<button type="button" class="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-stone-300 text-stone-600">' +
      ICON("image-plus", "h-4 w-4") +
      "</button>" +
      '<button type="button" class="flex h-[42px] shrink-0 items-center justify-center rounded-xl border px-3 text-xs font-bold tracking-wide ' +
      (gifOpen
        ? "border-amber-500 bg-amber-50 text-orange-700"
        : "border-stone-300 text-stone-600") +
      '">GIF</button>' +
      '<textarea rows="1" placeholder="Type a message..." class="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"></textarea>' +
      '<button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg bg-ember px-3 py-2.5 font-semibold text-stone-900 opacity-50 shadow-sm shadow-orange-500/30">' +
      ICON("send", "h-4 w-4") +
      "</button>" +
      "</div></div>"
    );
  }

  function chatArea(gifOpen) {
    return (
      '<div class="flex h-full flex-col">' +
      chatHeader(maya, true) +
      messageList() +
      messageInput(gifOpen) +
      "</div>"
    );
  }

  function chatsPanel(active, gifOpen) {
    var isChatOpen = !!active;
    var conversationsSection =
      '<section aria-label="Conversations" class="' +
      (isChatOpen ? "hidden lg:flex" : "flex") +
      ' w-full flex-col border-r border-stone-200 bg-white lg:w-80 lg:shrink-0">' +
      '<header class="hidden border-b border-stone-200 px-4 py-4 lg:block">' +
      '<h1 class="text-lg font-semibold text-stone-900">Messages</h1>' +
      "</header>" +
      '<div class="min-h-0 flex-1 overflow-y-auto">' +
      conversationList(active ? 0 : -1) +
      "</div></section>";

    var chatSection =
      '<section aria-label="Chat" class="' +
      (isChatOpen ? "flex" : "hidden lg:flex") +
      ' min-w-0 flex-1 flex-col bg-stone-50">' +
      (isChatOpen
        ? chatArea(gifOpen)
        : '<div class="flex flex-1 items-center justify-center">' +
          '<div class="animate-fade-slide-up flex flex-col items-center justify-center py-12 px-4 text-center">' +
          '<div class="animate-float mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-100">' +
          ICON("message-circle", "h-8 w-8 text-amber-500") +
          "</div>" +
          '<h3 class="text-lg font-semibold text-stone-900 mb-1">Select a conversation</h3>' +
          '<p class="text-sm text-stone-500 max-w-xs">Choose a conversation from the list or start a new one with a friend.</p>' +
          "</div></div>") +
      "</section>";

    return '<div class="flex h-full">' + conversationsSection + chatSection + "</div>";
  }

  /* ------------------------------- friends ------------------------------- */

  function friendsView(activeTab) {
    var tabs = [
      { id: "friends", label: "Friends", icon: "users", count: friends.length },
      { id: "requests", label: "Requests", icon: "user-plus", count: 2 },
      { id: "sent", label: "Sent", icon: "clock", count: 1 },
    ];
    var tabBar = tabs
      .map(function (t) {
        var active = activeTab === t.id;
        return (
          '<button type="button" role="tab" class="flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-sm font-medium transition-colors ' +
          (active
            ? "border-amber-500 text-orange-700"
            : "border-transparent text-stone-500") +
          '">' +
          ICON(t.icon, "h-4 w-4") +
          t.label +
          (t.count > 0
            ? '<span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[10px] font-medium text-orange-700">' +
              t.count +
              "</span>"
            : "") +
          "</button>"
        );
      })
      .join("");

    var content = "";
    if (activeTab === "friends") {
      content =
        '<div class="divide-y divide-stone-100">' +
        friends
          .map(function (f) {
            return (
              '<div class="flex items-center gap-3 px-4 py-3">' +
              avatar(f.name, { size: "md", online: f.online }) +
              '<div class="min-w-0 flex-1">' +
              '<h3 class="truncate text-sm font-medium text-stone-900">' +
              f.name +
              "</h3>" +
              '<p class="truncate text-xs text-stone-500">@' +
              f.username +
              "</p>" +
              "</div>" +
              '<button type="button" class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 transition-all hover:bg-stone-50">' +
              ICON("message-circle", "h-3.5 w-3.5") +
              "Message</button>" +
              "</div>"
            );
          })
          .join("") +
        "</div>";
    } else if (activeTab === "requests") {
      content =
        '<div class="divide-y divide-stone-100">' +
        [priya, { name: "Diego Moreno", username: "diegomoreno", online: true }]
          .map(function (s) {
            return (
              '<div class="flex items-center gap-3 px-4 py-3">' +
              avatar(s.name, { size: "md", online: s.online }) +
              '<div class="min-w-0 flex-1">' +
              '<h3 class="truncate text-sm font-medium text-stone-900">' +
              s.name +
              "</h3>" +
              '<p class="truncate text-xs text-stone-500">@' +
              s.username +
              "</p>" +
              "</div>" +
              '<div class="flex shrink-0 items-center gap-2">' +
              '<button type="button" class="inline-flex items-center justify-center gap-1 rounded-lg bg-ember px-3 py-1.5 text-sm font-semibold text-stone-900 shadow-sm shadow-orange-500/30">' +
              ICON("check", "h-3.5 w-3.5") +
              "Accept</button>" +
              '<button type="button" class="inline-flex items-center justify-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">' +
              ICON("x", "h-3.5 w-3.5") +
              "Decline</button>" +
              "</div></div>"
            );
          })
          .join("") +
        "</div>";
    } else {
      content =
        '<div class="divide-y divide-stone-100">' +
        '<div class="flex items-center gap-3 px-4 py-3">' +
        avatar("Owen Wright", { size: "md", online: false }) +
        '<div class="min-w-0 flex-1">' +
        '<h3 class="truncate text-sm font-medium text-stone-900">Owen Wright</h3>' +
        '<p class="text-xs text-stone-500">Request pending</p>' +
        "</div>" +
        '<button type="button" class="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">' +
        ICON("x", "h-3.5 w-3.5") +
        "Cancel</button>" +
        "</div></div>";
    }

    return (
      '<div class="flex h-full flex-col bg-white">' +
      '<div role="tablist" aria-label="Friends sections" class="flex border-b border-stone-200">' +
      tabBar +
      "</div>" +
      '<div class="min-h-0 flex-1 overflow-y-auto">' +
      content +
      "</div></div>"
    );
  }

  /* -------------------------------- search -------------------------------- */

  function userSearch() {
    var rows = searchResults
      .map(function (r) {
        var action = "";
        if (r.status === "friends") {
          action =
            '<span class="flex items-center gap-1 text-xs font-medium text-emerald-600">' +
            ICON("check", "h-3.5 w-3.5") +
            "Friends</span>";
        } else if (r.status === "requested") {
          action =
            '<span class="flex items-center gap-1 text-xs font-medium text-stone-500">' +
            ICON("clock", "h-3.5 w-3.5") +
            "Requested</span>";
        } else if (r.status === "incoming") {
          action =
            '<button type="button" class="inline-flex items-center justify-center rounded-lg bg-ember px-3 py-1.5 text-sm font-semibold text-stone-900 shadow-sm shadow-orange-500/30">Accept</button>';
        } else {
          action =
            '<button type="button" class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">' +
            ICON("user-plus", "h-3.5 w-3.5") +
            "Add</button>";
        }
        return (
          '<div class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-stone-50">' +
          avatar(r.user.name, { size: "md", online: r.user.online }) +
          '<div class="min-w-0 flex-1">' +
          '<h3 class="truncate text-sm font-medium text-stone-900">' +
          r.user.name +
          "</h3>" +
          '<p class="truncate text-xs text-stone-500">@' +
          r.user.username +
          "</p>" +
          "</div>" +
          action +
          "</div>"
        );
      })
      .join("");

    return (
      '<div class="flex h-full flex-col bg-white">' +
      '<div class="border-b border-stone-200 p-4">' +
      '<div class="relative">' +
      ICON("search", "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400") +
      '<input type="search" value="ma" placeholder="Search by name, username, or email" class="w-full rounded-xl border border-stone-300 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500">' +
      "</div></div>" +
      '<div class="min-h-0 flex-1 overflow-y-auto">' +
      '<div class="divide-y divide-stone-100">' +
      rows +
      "</div></div></div>"
    );
  }

  /* -------------------------------- profile -------------------------------- */

  function segmented(options, active) {
    return options
      .map(function (o) {
        var isActive = o.value === active;
        return (
          '<button type="button" class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
          (isActive
            ? "bg-amber-50 text-orange-800"
            : "text-stone-600 hover:bg-stone-100") +
          '">' +
          ICON(o.icon, "h-4 w-4") +
          o.label +
          "</button>"
        );
      })
      .join("");
  }

  function sectionTitle(text, extraClass) {
    return (
      '<h3 class="' +
      (extraClass || "mb-3") +
      ' text-xs font-semibold uppercase tracking-wider text-stone-500">' +
      text +
      "</h3>"
    );
  }

  function profileView() {
    return (
      '<div class="animate-fade-in flex h-full flex-col overflow-y-auto bg-white">' +
      '<div class="flex flex-col items-center px-4 py-8">' +
      '<div class="relative mb-4">' +
      '<div class="rounded-full bg-ember-strong p-[3px] shadow-lg shadow-orange-500/20">' +
      avatar(me.name, { size: "xl", online: true }) +
      "</div>" +
      '<button type="button" class="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-stone-900 shadow-lg">' +
      ICON("camera", "h-4 w-4") +
      "</button>" +
      "</div>" +
      '<h2 class="text-xl font-semibold text-stone-900">' +
      me.name +
      "</h2>" +
      '<p class="text-sm text-stone-500">@' +
      me.username +
      "</p>" +
      '<p class="mt-1 text-sm text-stone-600">' +
      me.email +
      "</p>" +
      '<p class="mt-2 max-w-xs text-center text-sm text-stone-500">' +
      me.bio +
      "</p>" +
      '<button type="button" class="mt-4 inline-flex items-center justify-center rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">Edit Profile</button>' +
      "</div>" +
      '<div class="border-t border-stone-200 px-4 py-4">' +
      sectionTitle("Appearance") +
      '<div class="flex gap-2">' +
      segmented(
        [
          { value: "light", icon: "sun", label: "Light" },
          { value: "dark", icon: "moon", label: "Dark" },
          { value: "system", icon: "monitor", label: "System" },
        ],
        "light"
      ) +
      "</div>" +
      sectionTitle("Motion", "mb-3 mt-5") +
      '<div class="flex gap-2">' +
      segmented(
        [
          { value: "full", icon: "sparkles", label: "Full" },
          { value: "reduced", icon: "waves", label: "Reduced" },
          { value: "system", icon: "monitor", label: "System" },
        ],
        "full"
      ) +
      "</div>" +
      '<p class="mt-2 text-xs text-stone-400">Choose <span class="font-medium">Full</span> if your system disables animations and you want them anyway.</p>' +
      "</div>" +
      '<div class="border-t border-stone-200 px-4 py-4">' +
      sectionTitle("Notifications") +
      '<button type="button" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm shadow-orange-500/30">' +
      ICON("bell", "h-4 w-4") +
      "Enable notifications</button>" +
      '<p class="mt-2 text-xs text-stone-400">Get alerted about new messages when Hearth is closed.</p>' +
      "</div>" +
      '<div class="border-t border-stone-200 px-4 py-4">' +
      sectionTitle("App") +
      '<button type="button" class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">' +
      ICON("download", "h-4 w-4") +
      "Install Hearth</button>" +
      '<p class="mt-2 text-xs text-stone-400">Add Hearth to your home screen for a full-screen, app-like experience.</p>' +
      "</div>" +
      '<div class="mt-auto border-t border-stone-200 px-4 py-4">' +
      '<button type="button" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">' +
      ICON("log-out", "h-4 w-4") +
      "Sign Out</button>" +
      "</div></div>"
    );
  }

  /* --------------------------------- login --------------------------------- */

  function loginPage() {
    return (
      '<main class="relative flex min-h-dvh items-center justify-center overflow-hidden bg-stone-50 px-4">' +
      '<div aria-hidden="true" class="pointer-events-none absolute inset-0">' +
      '<div class="animate-drift-a absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl"></div>' +
      '<div class="animate-drift-b absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl"></div>' +
      "</div>" +
      '<div class="animate-pop-in relative w-full max-w-sm">' +
      '<div class="mb-8 text-center">' +
      '<div class="animate-ember mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900">' +
      ICON("flame", "h-8 w-8 text-amber-400") +
      "</div>" +
      '<h1 class="text-2xl font-bold text-stone-900">Welcome to Hearth</h1>' +
      '<p class="mt-1 text-stone-500">Connect. Chat. Stay close.</p>' +
      "</div>" +
      '<div class="rounded-2xl border border-stone-200 bg-white/90 p-6 shadow-sm backdrop-blur">' +
      '<button type="button" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-stone-900 ring-1 ring-stone-300 transition-all hover:bg-stone-50">' +
      '<svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>' +
      '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
      '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>' +
      '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>' +
      "</svg>Continue with Google</button>" +
      '<button type="button" class="mt-4 w-full text-center text-xs font-medium text-orange-700 hover:text-orange-800">Pop-up blocked? Sign in with a redirect instead</button>' +
      "</div>" +
      '<p class="mt-4 text-center text-xs text-stone-500">Secure authentication powered by Firebase</p>' +
      "</div></main>"
    );
  }

  /* --------------------------------- share --------------------------------- */

  function sharePage() {
    var list = [maya, ava, priya, liam]
      .map(function (f) {
        return (
          '<button type="button" class="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-stone-50">' +
          avatar(f.name, { size: "md" }) +
          '<div class="min-w-0 flex-1">' +
          '<p class="truncate text-sm font-medium text-stone-900">' +
          f.name +
          "</p>" +
          '<p class="truncate text-xs text-stone-500">@' +
          f.username +
          "</p>" +
          "</div>" +
          ICON("send", "h-4 w-4 text-amber-500") +
          "</button>"
        );
      })
      .join("");

    return (
      '<main class="flex min-h-dvh items-center justify-center bg-stone-50 px-4 py-6">' +
      '<div class="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">' +
      '<div class="mb-4 flex items-center gap-3">' +
      '<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900">' +
      ICON("flame", "h-5 w-5 text-amber-400") +
      "</span>" +
      "<div>" +
      '<h1 class="text-base font-bold tracking-tight text-stone-900">Share to Hearth</h1>' +
      '<p class="text-xs text-stone-500">Pick a friend to send this to</p>' +
      "</div></div>" +
      '<div class="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">' +
      '<p class="line-clamp-3 break-all text-xs text-stone-600">https://example.com/a-very-interesting-article-about-campfires-and-coffee</p>' +
      "</div>" +
      '<div class="-mx-2 max-h-80 overflow-y-auto">' +
      list +
      "</div></div></main>"
    );
  }

  /* ------------------------------- overlays ------------------------------- */

  function userProfileModal() {
    return (
      '<div role="dialog" aria-modal="true" class="animate-fade-in fixed inset-0 z-[95] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">' +
      '<div class="animate-pop-in relative w-full max-w-sm rounded-t-3xl border border-stone-200 bg-white px-6 pb-8 pt-6 shadow-2xl sm:rounded-3xl">' +
      '<button type="button" class="absolute right-4 top-4 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-700">' +
      ICON("x", "h-4 w-4") +
      "</button>" +
      '<div class="flex flex-col items-center pt-2 text-center">' +
      '<div class="rounded-full bg-ember-strong p-[3px] shadow-lg shadow-orange-500/20">' +
      avatar(maya.name, { size: "xl", online: true }) +
      "</div>" +
      '<h2 class="mt-4 text-lg font-semibold text-stone-900">' +
      maya.name +
      "</h2>" +
      '<p class="text-sm text-stone-500">@' +
      maya.username +
      "</p>" +
      '<span class="mt-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Online</span>' +
      '<p class="mt-4 max-w-xs text-sm leading-relaxed text-stone-600">Product designer. Ramen enthusiast. Always up for a hike.</p>' +
      '<div class="mt-6 w-full rounded-xl border border-stone-200 px-4 py-3 text-left">' +
      '<p class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">On Hearth since</p>' +
      '<p class="mt-0.5 text-sm font-medium text-stone-700">March 2024</p>' +
      "</div></div></div></div>"
    );
  }

  function imageLightbox() {
    return (
      '<div role="dialog" aria-modal="true" class="animate-fade-in fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">' +
      '<button type="button" class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20">' +
      ICON("x", "h-5 w-5") +
      "</button>" +
      '<img src="' +
      photo("Ramen night", "#fbbf24", "#f97316") +
      '" alt="Photo" class="animate-pop-in max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl">' +
      "</div>"
    );
  }

  function toaster(message, type) {
    var icon = type === "error" ? "alert-circle" : type === "info" ? "info" : "check-circle-2";
    var iconColor = type === "error" ? "text-red-500" : type === "info" ? "text-amber-500" : "text-emerald-500";
    var border = type === "error" ? "border-red-200" : type === "info" ? "border-stone-200" : "border-emerald-200";
    return (
      '<div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">' +
      '<div role="status" class="animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border ' +
      border +
      ' bg-white px-4 py-3 shadow-lg">' +
      ICON(icon, "h-5 w-5 shrink-0 " + iconColor) +
      '<p class="flex-1 text-sm font-medium text-stone-900">' +
      message +
      "</p>" +
      '<button type="button" class="rounded-md p-1 text-stone-400 hover:text-stone-600">' +
      ICON("x", "h-4 w-4") +
      "</button></div></div>"
    );
  }

  /* --------------------------------- shell --------------------------------- */

  function shell(opts) {
    var chatOpen = !!opts.chatOpen;
    return (
      '<div class="flex h-dvh overflow-hidden bg-stone-50">' +
      sidebar(opts.activeTab, opts.unread || 0, opts.requests || 0) +
      '<div class="flex min-w-0 flex-1 flex-col">' +
      (chatOpen ? "" : mobileHeader(opts.activeTab)) +
      '<main class="min-h-0 flex-1 ' +
      (chatOpen ? "" : "pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0") +
      '">' +
      opts.panel +
      "</main></div>" +
      (chatOpen ? "" : mobileNav(opts.activeTab, opts.unread || 0, opts.requests || 0)) +
      "</div>"
    );
  }

  function shellChat(gifOpen, overlay) {
    return (
      shell({
        activeTab: "chats",
        unread: 2,
        requests: 2,
        chatOpen: true,
        panel: chatsPanel(true, gifOpen),
      }) + (overlay || "")
    );
  }

  /* --------------------------------- views --------------------------------- */

  var VIEWS = {
    login: function () {
      return loginPage();
    },
    share: function () {
      return sharePage();
    },
    "chats-empty": function () {
      return shell({
        activeTab: "chats",
        unread: 2,
        requests: 2,
        panel: chatsPanel(false),
      });
    },
    "chat-active": function () {
      return shellChat(false, "");
    },
    "chat-gif": function () {
      return shellChat(true, "");
    },
    "chat-profile": function () {
      return shellChat(false, userProfileModal());
    },
    "chat-lightbox": function () {
      return shellChat(false, imageLightbox());
    },
    "chat-toast": function () {
      return shellChat(false, toaster("Maya Chen: See you at 7 then?"));
    },
    friends: function () {
      return shell({
        activeTab: "friends",
        unread: 2,
        requests: 2,
        panel: friendsView("friends"),
      });
    },
    "friends-requests": function () {
      return shell({
        activeTab: "friends",
        unread: 2,
        requests: 2,
        panel: friendsView("requests"),
      });
    },
    "friends-sent": function () {
      return shell({
        activeTab: "friends",
        unread: 2,
        requests: 2,
        panel: friendsView("sent"),
      });
    },
    search: function () {
      return shell({
        activeTab: "search",
        unread: 2,
        requests: 2,
        panel: userSearch(),
      });
    },
    profile: function () {
      return shell({
        activeTab: "profile",
        unread: 2,
        requests: 2,
        panel: profileView(),
      });
    },
  };

  var params = new URLSearchParams(window.location.search);
  var view = params.get("view") || "chat-active";
  var factory = VIEWS[view] || VIEWS["chat-active"];

  document.getElementById("app").innerHTML = factory();

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  // Real chats open pinned to the newest message; mirror that in the capture.
  function scrollChatToBottom() {
    var el = document.querySelector(".chat-wallpaper");
    if (el) el.scrollTop = el.scrollHeight;
  }
  scrollChatToBottom();
  window.addEventListener("load", scrollChatToBottom);
  window.setTimeout(scrollChatToBottom, 60);
})();
