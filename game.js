'use strict';
/* =========================================================================
   十日终焉 · 终焉之地   ——   纯 HTML5 + CSS3 + JavaScript 网页游戏
   设定取自杀虫队队员《十日终焉》：参与者被困终焉之地，十日一洗牌，
   唯有觉醒「回响」者方能带着记忆进入新的轮回。
   ========================================================================= */

/* --------------------------- 全局配置 --------------------------- */
const CONFIG = {
  DAY_REAL_SECONDS: 300,   // 1 游戏日 = 现实时间 5 分钟 = 300 秒
  ECHO_INTERVAL_DAYS: 5,   // 每隔 5 游戏日获得一个「回响」
  TARGET_POINTS: 100,      // 集齐 100 积分即可通关
  MAX_DAY: 10,             // 十日终焉
  EXPLORE_COST: 10,        // 每次探索消耗体力
  GAMBLE_COST: 10          // 每次赌命消耗体力
};

/* --------------------------- 回响图鉴 --------------------------- */
const ECHOES = [
  { id:'fortune',   name:'强运',     icon:'🍀', desc:'幸运偏爱你：探索收获更好，赌局与游戏胜率大增，几乎不会遭遇不测。', flavor:'我听到了强运的回响，这是赌徒压上性命的执念。' },
  { id:'calamity',  name:'招灾',     icon:'🔥', desc:'灾祸被你引向他处：负面遭遇有几率反转为意外之喜。',                   flavor:'我听到了招灾的回响，这是一个卑微作家的惊惶。' },
  { id:'pilfer',    name:'探囊',     icon:'🖐️', desc:'总能多摸走一点：探索时额外获得物品的几率提升。',                     flavor:'我听到了探囊的回响，这是劣迹警官的高尚。' },
  { id:'breakall',  name:'破万法',   icon:'💥', desc:'一力降十会：生肖游戏的胜率大幅提升。',                               flavor:'我听到了破万法的回响，这是黑道打手的守护欲望。' },
  { id:'scapegoat', name:'替罪',     icon:'🛡️', desc:'伤害被悄然转移：每个游戏日可免疫一次伤害。',                         flavor:'我听到了替罪的回响，这是一段义气疯子的铿锵。' },
  { id:'craft',     name:'巧物',     icon:'🔧', desc:'化腐朽为神奇：获得的物品有几率翻倍。',                               flavor:'我听到了巧物的回响，这是巧手匠人的温柔。' },
  { id:'disassemble',name:'离析',    icon:'🧩', desc:'拆解万物：探索时额外获得积分的几率提升。',                           flavor:'我听到了离析的回响，这是疯狂医生的执念。' },
  { id:'tianxingjian',name:'天行健', icon:'🏃', desc:'自强不息：体力上限提升，恢复速度加快。',                             flavor:'我听到了天行健的回响，这是伟大斗士的不息自强。' },
  { id:'endless',   name:'生生不息', icon:'♻️', desc:'你不是一个人在战斗：持续恢复生命，濒死时必定带着记忆重生。',         flavor:'我看到了生生不息的激荡，这是一个骗子的伟大乐章。' },
  { id:'causality', name:'因果',     icon:'🔗', desc:'改写逻辑：关键时刻有几率把坏结果变为好结果。',                       flavor:'我听到了因果的回响，这是漫游之人的理想。' },
  { id:'hide',      name:'隐匿',     icon:'🌫️', desc:'不被看见：危险遭遇大幅减少。',                                       flavor:'我听到了隐匿的回响，这是畏光者的生存本能。' },
  { id:'twinflower',name:'双生花',   icon:'🌺', desc:'一切成双：任何积分收获有几率翻倍。',                                 flavor:'我听到了双生花的回响。' },
  { id:'heal',      name:'治愈',     icon:'💚', desc:'伤口愈合：休息时回复大量生命。',                                     flavor:'我听到了治愈的回响，这是医者的仁心。' },
  { id:'karma',     name:'业力',     icon:'⚖️', desc:'善业得善果：善举与帮助他人的收益翻倍。',                             flavor:'我听到了业力的回响，这是善业者的因果。' }
];

/* --------------------------- 物品 --------------------------- */
const ITEMS = {
  intel: { name:'情报', icon:'📜' },
  herb:  { name:'药草', icon:'🌿' },
  iron:  { name:'铁片', icon:'🔩' },
  token: { name:'信物', icon:'🪙' }
};

/* --------------------------- NPC 与任务 --------------------------- */
const NPCS = [
  {
    id:'qixia', name:'齐夏', echo:'生生不息', role:'白羊 · 反抗计划的策划者', avatar:'♟️',
    intro:'「我答应过他们，要带所有人出去。」他平静地看着你，仿佛早已算到你的到来。',
    quests:[
      { desc:'搜集 3 份「情报」交给齐夏', items:{ intel:3 }, points:12,
        deliver:'齐夏把情报在膝上摊开，逐字比对：「很好，棋盘上又多了一枚子。」' },
      { desc:'赢下 1 场「生肖游戏」后向齐夏汇报', counter:['gameWin',1], points:20,
        deliver:'「赢了。」他只说了两个字，眼里却亮了一下。' }
    ]
  },
  {
    id:'chenjunnan', name:'陈俊南', echo:'替罪', role:'猫 · 攻心的搅局者', avatar:'🐱',
    intro:'「小爷我在这鬼地方混了七年，信不信由你。」他咧嘴一笑，露出一口白牙。',
    quests:[
      { desc:'交给陈俊南 2 份「情报」', items:{ intel:2 }, points:10,
        deliver:'「哟，有点东西。」陈俊南把情报塞进袖里，冲你挑了挑眉。' },
      { desc:'在赌局中赢下 1 次', counter:['gambleWin',1], points:15,
        deliver:'陈俊南哈哈大笑：「运气这东西，也是能借的。」' }
    ]
  },
  {
    id:'lishangwu', name:'李尚武', echo:'探囊', role:'警官 · 劣迹斑斑的好人', avatar:'👮',
    intro:'「别叫我好人，我只是……还没坏透。」他别开脸，把烟摁灭在墙上。',
    quests:[
      { desc:'交给李尚武 3 块「铁片」', items:{ iron:3 }, points:12,
        deliver:'李尚武掂了掂铁片：「够了，能给你打把防身的东西。」' }
    ]
  },
  {
    id:'tiantian', name:'甜甜', echo:'巧物', role:'巧手 · 制造者', avatar:'🎀',
    intro:'「只要给我材料，什么都能做出来哦。」她晃着两条辫子，眼睛亮晶晶的。',
    quests:[
      { desc:'交给甜甜 2 株「药草」与 1 块「铁片」', items:{ herb:2, iron:1 }, points:15,
        deliver:'甜甜叮叮当当地鼓捣一阵，塞给你一枚温热的护符：「拿好，能保命的。」' }
    ]
  },
  {
    id:'tongyi', name:'童姨', echo:'业力', role:'教官 · 天堂口的元老', avatar:'🧅',
    intro:'「只要你坚定不移地认为自己的业是善业，就能得善终。」她缓缓说道。',
    quests:[
      { desc:'完成 1 次善举（在探索中帮助他人）', counter:['help',1], points:10,
        deliver:'童姨点点头：「善业，已经记下了。」' }
    ]
  },
  {
    id:'yunyao', name:'云瑶', echo:'强运', role:'天堂口 · 赌命的灵视者', avatar:'🎴',
    intro:'「敢不敢跟我赌一局？赢了我，运气分你一半。」她展开一把扑克，笑得意味不明。',
    quests:[
      { desc:'向云瑶证明你的运气：赢下 2 次赌局', counter:['gambleWin',2], points:10,
        deliver:'云瑶眯起眼：「有意思，你的运气……不像这里的人。」' }
    ]
  }
];

/* --------------------------- 探索事件 --------------------------- */
const EVENTS = [
  { id:'supply',    kind:'good',    icon:'📦', weight:10, points:[2,5], text:'你在废墟的夹缝里翻出一只未开封的补给箱。' },
  { id:'intel',     kind:'good',    icon:'📜', weight:9,  item:'intel', text:'一张被雨水泡皱的传单上写满了密语——那是一份「情报」。' },
  { id:'herb',      kind:'good',    icon:'🌿', weight:8,  item:'herb',  text:'断墙后竟长着一簇药草，绿得可疑，却货真价实。' },
  { id:'iron',      kind:'good',    icon:'🔩', weight:8,  item:'iron',  text:'你从倒塌的铁架上掰下一块还算完整的铁片。' },
  { id:'altar',     kind:'good',    icon:'⛩️', weight:6,  points:[3,6], text:'四座巨钟的余音在耳边回荡，你忽然对「信念」多了一分领悟。' },
  { id:'resident',  kind:'bad',     icon:'🧟', weight:9,  hp:[-12,-6],  text:'一个失去理智的原住民（癫人）嘶吼着扑向你！' },
  { id:'trap',      kind:'bad',     icon:'🕳️', weight:8,  hp:[-15,-5],  text:'脚下的地砖骤然塌陷，尖刺扎进小腿。' },
  { id:'dust',      kind:'bad',     icon:'🌪️', weight:7,  hp:[-8,-3], stamina:[-12,-6], text:'红色的沙尘暴毫无征兆地席卷而来，你被呛得几乎窒息。' },
  { id:'resident2', kind:'neutral', icon:'🏚️', weight:6,  item:'token', text:'一名疯癫的「原住民」絮絮叨叨地塞给你一样东西，随即消失在雾里。' },
  { id:'game',      kind:'special', icon:'🎲', weight:9,  text:'前方传来鼓掌与哄笑——一名戴着动物面具的「生肖」正在此地开设游戏。' },
  { id:'help',      kind:'good',    icon:'🤝', weight:6,  points:[1,3], help:true, text:'一名受伤的参与者蜷缩在角落，你把仅剩的水递给了他。' },
  { id:'echoStone', kind:'good',    icon:'🔮', weight:4,  points:[1,4], text:'一块嵌在墙上的眼球残骸让你心神一震——那是「回响」残留的痕迹。' }
];

/* --------------------------- 工具函数 --------------------------- */
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function chance(p) { return Math.random() < p; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pickWeighted(list) {
  const total = list.reduce((s, e) => s + (e.weight || 1), 0);
  let r = Math.random() * total;
  for (const e of list) { r -= (e.weight || 1); if (r <= 0) return e; }
  return list[list.length - 1];
}
function fmtClock(sec) {
  const h = Math.floor(sec / CONFIG.DAY_REAL_SECONDS * 24);
  const m = Math.floor((sec / CONFIG.DAY_REAL_SECONDS * 24 * 60) % 60);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
function fmtCountdown(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}

/* --------------------------- 游戏状态 --------------------------- */
function defaultState() {
  return {
    started: false,
    elapsed: 0,          // 已流逝的游戏秒数
    day: 1,
    speed: 1,
    paused: false,
    over: false,
    won: false,
    points: 0,
    hp: 100, hpMax: 100,
    stamina: 100, staminaMax: 100,
    echoes: [],          // [{id, day}]
    inventory: { intel:0, herb:0, iron:0, token:0 },
    counters: { explore:0, gameWin:0, gambleWin:0, help:0 },
    npcProg: {},         // npcId -> 已完成任务数
    negateUsed: false,   // 替罪本日是否已用
    log: [],
    lastSaved: 0
  };
}
let state = defaultState();

/* --------------------------- 回响效果查询 --------------------------- */
function has(id) { return state.echoes.some(e => e.id === id); }

/* --------------------------- 日志 --------------------------- */
function pushLog(text, cls) {
  state.log.push({ t: text, cls: cls || '' });
  if (state.log.length > 60) state.log.shift();
  renderScene();
}

/* --------------------------- 回响获取 --------------------------- */
function grantEcho() {
  const owned = a => state.echoes.some(e => e.id === a.id);
  let pool = ECHOES.filter(e => !owned(e));
  let isNew = true;
  if (pool.length === 0) { pool = ECHOES; isNew = false; } // 全部拥有则重复叠加
  const e = pool[randInt(0, pool.length - 1)];
  state.echoes.push({ id:e.id, day: state.day });
  applyPassives();
  // 强化风味：生生不息用「看到」
  const verb = e.id === 'endless' ? '看到了' : '听到了';
  pushLog(`【第 ${state.day} 日】巨钟轰鸣，显示屏亮起——`, 'echo-day');
  pushLog(`「我${verb}「${e.name}」的回响${e.id==='endless'?'的激荡':''}。」`, 'echo-line');
  showEchoOverlay(e, isNew);
  bumpDirty();
}

/* 被动效果：每次获得回响后重算上限 */
function applyPassives() {
  state.hpMax = 100 + (has('endless') ? 30 : 0);
  state.staminaMax = 100 + (has('tianxingjian') ? 50 : 0);
  state.hp = clamp(state.hp, 0, state.hpMax);
  state.stamina = clamp(state.stamina, 0, state.staminaMax);
}

/* --------------------------- 时间推进 --------------------------- */
let lastTs = 0;
function tick() {
  const now = performance.now();
  const dt = Math.min(2, (now - lastTs) / 1000);
  lastTs = now;
  if (state.started && !state.paused && !state.over) advance(dt * state.speed);
  renderHUD();
  if (dirty) { renderTabs(); dirty = false; }
  autoSave();
}
function advance(dt) {
  state.elapsed += dt;
  // 体力自然恢复：约 1 游戏日回满
  const stamRate = state.staminaMax / CONFIG.DAY_REAL_SECONDS * (has('tianxingjian') ? 2 : 1);
  state.stamina = clamp(state.stamina + dt * stamRate, 0, state.staminaMax);
  // 生生不息 / 治愈 被动回血：约 1 游戏日回满
  let hpRate = 0;
  if (has('endless')) hpRate += state.hpMax / CONFIG.DAY_REAL_SECONDS;
  if (has('heal')) hpRate += state.hpMax / CONFIG.DAY_REAL_SECONDS * 0.5;
  if (hpRate > 0) state.hp = clamp(state.hp + dt * hpRate, 0, state.hpMax);

  // 跨日检测（每步重算，避免「终焉」重置 elapsed 后陷入死循环）
  let guard = 0;
  while (guard++ < 1000) {
    const d = Math.floor(state.elapsed / CONFIG.DAY_REAL_SECONDS) + 1;
    if (state.day >= d) break;
    state.day++;
    onNewDay(state.day);
  }
}
function onNewDay(day) {
  state.negateUsed = false;
  pushLog(`——————  第 ${day} 日  ——————`, 'day');
  if (day % CONFIG.ECHO_INTERVAL_DAYS === 0) grantEcho();
  if (day === CONFIG.MAX_DAY) pushLog('远处的巨钟发出低沉的轰响……十日之期将至。', 'warn');
  if (day > CONFIG.MAX_DAY) tenDaysEnd();
}

/* --------------------------- 十日终焉 --------------------------- */
function tenDaysEnd() {
  if (state.points >= CONFIG.TARGET_POINTS) { winGame(); return; }
  pushLog('天空骤然撕裂，血色的日光倾泻而下——「终焉」降临了。', 'bad');
  pushLog('你的身体开始粉末化，意识被拖入黑暗……', 'bad');
  state.elapsed = 0;
  state.day = 1;
  state.hp = state.hpMax;
  state.stamina = state.staminaMax;
  const remembered = state.echoes.length > 0;
  pushLog(remembered
    ? '生生不息的激荡再度响起，你带着记忆在第 1 日的面试房间里睁开眼。'
    : '你在面试房间里睁开眼，记忆残缺——但你隐约记得，自己已经来过这里。', 'warn');
  bumpDirty();
}

/* --------------------------- 伤害与治疗 --------------------------- */
function damage(amount) {
  amount = Math.round(amount);
  if (amount <= 0) return 0;
  if (has('scapegoat') && !state.negateUsed) {
    state.negateUsed = true;
    pushLog('伤害被无声地转移到了别处（替罪）。', 'good');
    return 0;
  }
  if (has('causality') && chance(0.2)) {
    pushLog('因果被改写——本该落到你身上的伤害凭空消散了。', 'good');
    return 0;
  }
  state.hp = clamp(state.hp - amount, 0, state.hpMax);
  if (state.hp <= 0) onDeath();
  return amount;
}
function heal(amount) {
  state.hp = clamp(state.hp + Math.round(amount), 0, state.hpMax);
}
function onDeath() {
  if (has('endless')) {
    state.hp = Math.round(state.hpMax * 0.5);
    state.stamina = state.staminaMax;
    pushLog('你倒下的瞬间，生生不息将你重新拉起——回响者不会真正死去。', 'echo-line');
    return;
  }
  pushLog('你的意识沉入无边的黑暗……', 'bad');
  gameOver('你死了。但终焉之地不会放你离开——没有「回响」的人，连死亡都无法带走记忆。');
}

/* --------------------------- 积分结算 --------------------------- */
function gainPoints(amount, reason) {
  amount = Math.round(amount);
  if (amount <= 0) return;
  let final = amount;
  if (has('twinflower') && chance(0.25)) { final *= 2; pushLog('双生花绽放，收获翻倍！', 'good'); }
  state.points += final;
  if (reason) pushLog(`获得积分 +${final}（${reason}）。`, 'good');
  else pushLog(`获得积分 +${final}。`, 'good');
  if (state.points >= CONFIG.TARGET_POINTS && !state.won) winGame();
}

/* --------------------------- 玩家动作：探索 --------------------------- */
function explore() {
  if (!state.started || state.paused || state.over) return;
  if (state.stamina < CONFIG.EXPLORE_COST) { pushLog('体力不足，先休息一会儿吧。', 'warn'); return; }
  state.stamina -= CONFIG.EXPLORE_COST;
  state.counters.explore++;
  pushLog('你独自走进终焉之地的颓败街巷……', 'muted');

  // 事件池：隐匿 / 强运 降低负面权重
  const pool = EVENTS.map(ev => {
    const c = Object.assign({}, ev);
    if (c.kind === 'bad') {
      let w = c.weight;
      if (has('hide')) w *= 0.35;
      if (has('fortune')) w *= 0.4;
      if (has('breakall')) w *= 0.75;
      c.weight = w;
    }
    return c;
  });
  const ev = pickWeighted(pool);
  pushLog(`${ev.icon} ${ev.text}`);
  resolveEvent(ev);
  bumpDirty();
}

function resolveEvent(ev) {
  if (ev.kind === 'special') { openGame(); return; }

  let kind = ev.kind;
  // 招灾 / 因果：坏事反转为好事
  if (kind === 'bad') {
    if (has('calamity') && chance(0.35)) { pushLog('招灾的回响发动——祸水被引向了别处！', 'echo-line'); kind = 'good'; ev = Object.assign({}, ev, { kind:'good', points:[2,5], hp:null, stamina:null }); }
    else if (has('causality') && chance(0.2)) { pushLog('因果被改写，坏结果翻转成了好结果！', 'echo-line'); kind = 'good'; ev = Object.assign({}, ev, { kind:'good', points:[2,4], hp:null, stamina:null }); }
  }

  const isGood = kind === 'good';

  // 处理伤害 / 体力损失
  if (ev.hp && ev.hp.length === 2 && !isGood) {
    const dmg = randInt(Math.min(ev.hp[0], ev.hp[1]), Math.max(ev.hp[0], ev.hp[1]));
    const real = damage(Math.abs(dmg));
    if (real > 0) pushLog(`你受到了 ${real} 点伤害。`, 'bad');
  }
  if (ev.stamina && ev.stamina.length === 2 && !isGood) {
    const loss = randInt(Math.abs(ev.stamina[1]), Math.abs(ev.stamina[0]));
    state.stamina = clamp(state.stamina - loss, 0, state.staminaMax);
    pushLog(`体力 -${loss}。`, 'bad');
  }

  // 处理物品
  let gotItem = null;
  if (ev.item) {
    let n = 1;
    if (has('pilfer') && chance(0.4)) { n++; pushLog('探囊的回响让你多摸走了一份。', 'echo-line'); }
    if (has('craft') && chance(0.25)) { n++; pushLog('巧物将材料复制了一份。', 'echo-line'); }
    if (isGood || ev.item === 'token') {
      state.inventory[ev.item] = (state.inventory[ev.item] || 0) + n;
      gotItem = ev.item;
      pushLog(`获得「${ITEMS[ev.item].name}」×${n}。`, 'good');
    }
  }

  // 处理积分
  if (ev.points && isGood) {
    let p = randInt(Math.min(ev.points[0], ev.points[1]), Math.max(ev.points[0], ev.points[1]));
    if (has('disassemble') && chance(0.4)) { p += 2; pushLog('离析将残骸拆解成了可用之物。', 'echo-line'); }
    if (ev.help) {
      state.counters.help++;
      if (has('karma')) { p *= 2; pushLog('业力的回响让这份善业加倍回报。', 'echo-line'); }
      pushLog('你完成了一次善举。', 'muted');
    }
    gainPoints(p);
  }
}

/* --------------------------- 玩家动作：休息 --------------------------- */
let lastRest = 0;
function restAction() {
  if (!state.started || state.paused || state.over) return;
  const now = performance.now();
  if (now - lastRest < 8000) { pushLog('你现在还不想休息。', 'muted'); return; }
  lastRest = now;
  const sp = Math.round(state.staminaMax * 0.5);
  let hp = Math.round(state.hpMax * 0.2);
  if (has('heal')) hp += Math.round(state.hpMax * 0.35);
  state.stamina = clamp(state.stamina + sp, 0, state.staminaMax);
  heal(hp);
  pushLog(`你靠着断墙坐下，喘了口气。体力 +${sp}，生命 +${hp}。`, 'good');
  bumpDirty();
}

/* --------------------------- 玩家动作：赌命（云瑶） --------------------------- */
function openGamble() {
  if (!state.started || state.paused || state.over) return;
  if (state.stamina < CONFIG.GAMBLE_COST) { pushLog('体力不足，赌不动了。', 'warn'); return; }
  const html = `
    <h2>赌 命</h2>
    <p class="modal-sub">云瑶把两枚骨牌扣在掌心：「押大，还是押小？」<br>
    两点点数之和 3–7 为「小」，8–12 为「大」，7 点例外为「平」。</p>
    <div class="modal-actions">
      <button onclick="doGamble('small')">押 小</button>
      <button onclick="doGamble('big')">押 大</button>
    </div>`;
  showOverlay(html);
}
function doGamble(bet) {
  state.stamina -= CONFIG.GAMBLE_COST;
  const a = randInt(1, 6), b = randInt(1, 6);
  const sum = a + b;
  const result = sum === 7 ? 'flat' : (sum >= 8 ? 'big' : 'small');
  let winChance = 0.45;
  if (has('fortune')) winChance += 0.15;
  if (has('causality')) winChance += 0.10;
  const forcedWin = result !== 'flat' && result !== bet && chance(winChance * 0.6);

  let face = result;
  if (forcedWin) face = bet; // 回响暗中改命
  const win = face === bet;

  hideOverlay();
  pushLog(`骨牌落定：${a} + ${b} = ${sum}（${face === 'big' ? '大' : face === 'small' ? '小' : '平'}）。`);
  if (win) {
    state.counters.gambleWin++;
    let p = randInt(3, 6);
    if (forcedWin) pushLog('冥冥之中，命运被拨向了你的方向……', 'echo-line');
    gainPoints(p, '赌命获胜');
  } else if (face === 'flat') {
    pushLog('平局——云瑶似笑非笑地收回了骨牌。', 'muted');
  } else {
    const dmg = randInt(5, 10);
    const real = damage(dmg);
    if (real > 0) pushLog(`你输了，代价是 ${real} 点生命。`, 'bad');
  }
  bumpDirty();
}

/* --------------------------- 生肖游戏（探索触发） --------------------------- */
function openGame() {
  const html = `
    <h2>生 肖 游 戏</h2>
    <p class="modal-sub">戴羊面具的「生肖」晃着三只盒子：<br>
    「三只盒子，只有一只藏着奖品。选吧——欺诈，是羊的领域。」</p>
    <div class="modal-actions">
      <button onclick="playGame(0)">盒 一</button>
      <button onclick="playGame(1)">盒 二</button>
      <button onclick="playGame(2)">盒 三</button>
    </div>`;
  showOverlay(html);
}
function playGame(choice) {
  let winChance = 0.33;
  if (has('breakall')) winChance += 0.27;
  if (has('fortune')) winChance += 0.12;
  if (has('causality')) winChance += 0.08;
  winChance = Math.min(0.95, winChance);
  const truth = randInt(0, 2);
  const win = (choice === truth) || chance(winChance * 0.5);
  hideOverlay();

  if (win) {
    state.counters.gameWin++;
    let p = randInt(4, 8);
    if (has('breakall')) pushLog('破万法撕碎了生肖设下的障眼法——真相无所遁形。', 'echo-line');
    pushLog('羊面具发出一声不甘的轻响，奖品归你。', 'good');
    gainPoints(p, '攻克生肖游戏');
  } else {
    pushLog('盒子空空如也。羊面具后传来嘲弄的笑声。', 'bad');
    const dmg = randInt(6, 12);
    const real = damage(dmg);
    if (real > 0) pushLog(`游戏失败的惩罚：生命 -${real}。`, 'bad');
  }
  bumpDirty();
}

/* --------------------------- 任务系统 --------------------------- */
function npcProg(id) { return state.npcProg[id] || 0; }
function currentQuest(npc) { return npc.quests[npcProg(npc.id)] || null; }
function questMet(q) {
  if (!q) return false;
  if (q.items) {
    for (const k in q.items) if ((state.inventory[k] || 0) < q.items[k]) return false;
  }
  if (q.counter) {
    if ((state.counters[q.counter[0]] || 0) < q.counter[1]) return false;
  }
  return true;
}
function questProgressText(q) {
  const parts = [];
  if (q.items) for (const k in q.items) parts.push(`${ITEMS[k].name} ${state.inventory[k] || 0}/${q.items[k]}`);
  if (q.counter) {
    const label = { gameWin:'生肖游戏胜利', gambleWin:'赌局胜利', help:'善举', explore:'探索次数' }[q.counter[0]] || q.counter[0];
    parts.push(`${label} ${state.counters[q.counter[0]] || 0}/${q.counter[1]}`);
  }
  return parts.join('，');
}
function completeQuest(npcId) {
  const npc = NPCS.find(n => n.id === npcId);
  const q = currentQuest(npc);
  if (!q || !questMet(q)) return;
  if (q.items) for (const k in q.items) state.inventory[k] -= q.items[k];
  state.npcProg[npcId] = npcProg(npcId) + 1;
  pushLog(`${npc.avatar} ${npc.name}：${q.deliver}`, 'npc-line');
  gainPoints(q.points, `完成「${npc.name}」的委托`);
  bumpDirty();
}

/* --------------------------- 交易（极乐钱庄） --------------------------- */
const SHOP = [
  { give:{ intel:1 }, points:2 },
  { give:{ iron:1 },  points:2 },
  { give:{ herb:1 },  points:2 },
  { give:{ token:1 }, points:3 },
  { get:{ intel:1 },  cost:5 }
];
function trade(idx) {
  const t = SHOP[idx];
  if (t.points) {
    for (const k in t.give) if ((state.inventory[k] || 0) < t.give[k]) { pushLog('你没有足够的物品。', 'warn'); return; }
    for (const k in t.give) state.inventory[k] -= t.give[k];
    pushLog(`你在极乐钱庄卖出物品，换得 ${t.points} 积分。`, 'good');
    gainPoints(t.points);
  } else if (t.cost) {
    if (state.points < t.cost) { pushLog('积分不足。', 'warn'); return; }
    state.points -= t.cost;
    for (const k in t.get) state.inventory[k] = (state.inventory[k] || 0) + t.get[k];
    pushLog(`你花费 ${t.cost} 积分购得「${ITEMS[Object.keys(t.get)[0]].name}」。`, 'muted');
  }
  bumpDirty();
}

/* --------------------------- 胜负 --------------------------- */
function winGame() {
  if (state.won) return;
  state.won = true; state.over = true;
  pushLog('集齐了 100 积分——通往「门」的资格，在你手中成形。', 'echo-line');
  showOverlay(`
    <h2 class="win-title">你 通 关 了</h2>
    <p class="modal-sub">积分已达 ${CONFIG.TARGET_POINTS}。巨钟齐鸣，显示屏上浮现出你的名字。<br>
    但齐夏说：「集齐积分从来不是终点。」<br><br>
    你共觉醒 <b>${state.echoes.length}</b> 个回响，度过第 <b>${state.day}</b> 日。<br>
    ${state.echoes.map(e => `<span class="chip">${e.icon}${e.name}</span>`).join(' ')}</p>
    <div class="modal-actions"><button onclick="restart()">再来一次轮回</button></div>`, false);
}
function gameOver(reason) {
  if (state.over) return;
  state.over = true;
  showOverlay(`
    <h2 class="lose-title">终 焉</h2>
    <p class="modal-sub">${reason}</p>
    <div class="modal-actions"><button onclick="restart()">重新开始</button></div>`, false);
}

/* --------------------------- 存档 --------------------------- */
function save() {
  try {
    state.lastSaved = Date.now();
    localStorage.setItem('the_end_of_ten_days', JSON.stringify(state));
  } catch (e) { /* ignore */ }
}
function autoSave() {
  const now = Date.now();
  if (now - (state.lastSaved || 0) > 5000) save();
}
function load() {
  try {
    const raw = localStorage.getItem('the_end_of_ten_days');
    if (!raw) return false;
    const s = JSON.parse(raw);
    state = Object.assign(defaultState(), s);
    return true;
  } catch (e) { return false; }
}
function resetGame() {
  try { localStorage.removeItem('the_end_of_ten_days'); } catch (e) {}
  state = defaultState();
}
function restart() { resetGame(); hideOverlay(); showIntro(); }

/* =========================================================================
                              渲染层
   ========================================================================= */
let dirty = true;
function bumpDirty() { dirty = true; }

function renderHUD() {
  document.getElementById('dayNum').textContent = state.day;
  document.getElementById('clock').textContent = fmtClock(state.elapsed % CONFIG.DAY_REAL_SECONDS);
  document.getElementById('points').textContent = state.points;

  document.getElementById('hpText').textContent = Math.round(state.hp) + '/' + state.hpMax;
  document.getElementById('hpBar').style.width = (state.hp / state.hpMax * 100) + '%';
  document.getElementById('spText').textContent = Math.round(state.stamina) + '/' + state.staminaMax;
  document.getElementById('spBar').style.width = (state.stamina / state.staminaMax * 100) + '%';

  document.getElementById('progFill').style.width = clamp(state.points / CONFIG.TARGET_POINTS * 100, 0, 100) + '%';

  // 下一回响倒计时
  const nextEchoDay = (Math.floor((state.day - 1) / CONFIG.ECHO_INTERVAL_DAYS) + 1) * CONFIG.ECHO_INTERVAL_DAYS;
  const nextEchoSec = nextEchoDay * CONFIG.DAY_REAL_SECONDS - state.elapsed;
  const cd = document.getElementById('echoCountdown');
  if (cd) cd.textContent = fmtCountdown(nextEchoSec);

  // 回响条
  const bar = document.getElementById('echoBar');
  if (bar) {
    bar.innerHTML = state.echoes.length
      ? state.echoes.map(e => `<span class="echo-chip" title="${ECHOES.find(x=>x.id===e.id).desc}">${ECHOES.find(x=>x.id===e.id).icon} ${ECHOES.find(x=>x.id===e.id).name}</span>`).join('')
      : '<span class="echo-empty">尚未觉醒回响</span>';
  }

  // 暂停按钮
  const pb = document.getElementById('pauseBtn');
  if (pb) pb.textContent = state.paused ? '继续' : '暂停';
}

function renderScene() {
  const el = document.getElementById('scene');
  if (!el) return;
  el.innerHTML = state.log.map(l => `<div class="log ${l.cls}">${l.t}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}

let activeTab = 'npc';
function switchTab(t) { activeTab = t; bumpDirty(); renderTabs(); }

function renderTabs() {
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
  const c = document.getElementById('tabContent');
  if (!c) return;
  if (activeTab === 'npc') c.innerHTML = renderNPCs();
  else if (activeTab === 'echo') c.innerHTML = renderEchoCodex();
  else if (activeTab === 'bag') c.innerHTML = renderBag();
  else if (activeTab === 'rule') c.innerHTML = renderRules();
}

function renderNPCs() {
  return NPCS.map(npc => {
    const q = currentQuest(npc);
    const done = npcProg(npc.id) >= npc.quests.length;
    let questHtml;
    if (done) {
      questHtml = `<div class="quest done">✓ 委托已全部完成</div>`;
    } else {
      const met = questMet(q);
      questHtml = `
        <div class="quest">
          <div class="quest-title">委托 · ${q.desc}</div>
          <div class="quest-prog">进度：${questProgressText(q)}</div>
          <button class="deliver ${met ? '' : 'disabled'}" ${met ? '' : 'disabled'} onclick="completeQuest('${npc.id}')">
            ${met ? '交付（+' + q.points + ' 积分）' : '条件不足'}
          </button>
        </div>`;
    }
    return `
      <div class="npc-card">
        <div class="npc-head">
          <span class="npc-avatar">${npc.avatar}</span>
          <div>
            <div class="npc-name">${npc.name} <span class="npc-echo">「${npc.echo}」的回响</span></div>
            <div class="npc-role">${npc.role}</div>
          </div>
        </div>
        <div class="npc-intro">${npc.intro}</div>
        ${questHtml}
      </div>`;
  }).join('');
}

function renderEchoCodex() {
  const owned = id => state.echoes.some(e => e.id === id);
  return `<div class="codex-note">每 ${CONFIG.ECHO_INTERVAL_DAYS} 个游戏日（现实 ${CONFIG.ECHO_INTERVAL_DAYS * CONFIG.DAY_REAL_SECONDS / 60} 分钟）你将随机觉醒一个「回响」。回响会切实改变你的行为与命运。</div>`
    + ECHOES.map(e => `
      <div class="echo-card ${owned(e.id) ? 'owned' : 'locked'}">
        <div class="echo-card-head"><span class="echo-icon">${e.icon}</span>
          <span class="echo-name">${e.name}</span>
          ${owned(e.id) ? '<span class="owned-tag">已觉醒</span>' : ''}
        </div>
        <div class="echo-desc">${e.desc}</div>
        <div class="echo-flavor">「${e.flavor}」</div>
      </div>`).join('');
}

function renderBag() {
  const inv = Object.keys(ITEMS).map(k =>
    `<div class="bag-item ${state.inventory[k] ? '' : 'empty'}">
       <span class="bag-icon">${ITEMS[k].icon}</span>
       <span class="bag-name">${ITEMS[k].name}</span>
       <span class="bag-count">×${state.inventory[k] || 0}</span>
     </div>`).join('');
  const shop = `
    <div class="shop">
      <h4>极乐钱庄 · 交易</h4>
      <div class="shop-row">
        <button onclick="trade(0)">卖 情报 +2</button>
        <button onclick="trade(1)">卖 铁片 +2</button>
        <button onclick="trade(2)">卖 药草 +2</button>
        <button onclick="trade(3)">卖 信物 +3</button>
        <button onclick="trade(4)">买 情报 -5</button>
      </div>
      <p class="muted-note">「极乐钱庄」是齐夏留下的资源枢纽，汇聚着终焉之地的信息与人脉。</p>
    </div>`;
  return `<div class="stat-line">当前积分：<b>${state.points}</b> / ${CONFIG.TARGET_POINTS}</div>
    <div class="bag-grid">${inv}</div>${shop}`;
}

function renderRules() {
  return `
    <div class="rules">
      <p><b>1. 时间与轮回：</b>1 个游戏日 = 现实 5 分钟。自第 1 日苏醒起，至第 ${CONFIG.MAX_DAY} 日结束；第 11 日将触发「终焉」大洗牌。</p>
      <p><b>2. 回响：</b>每 ${CONFIG.ECHO_INTERVAL_DAYS} 个游戏日，你会因「信念」而觉醒一个随机回响（如「强运」「生生不息」）。回响会真实影响探索、赌局、战斗与生存。</p>
      <p><b>3. 通关：</b>通过与 NPC 互动、完成委托、探索终焉之地，集齐 <b>${CONFIG.TARGET_POINTS}</b> 积分即可通关。</p>
      <p><b>4. 生命与体力：</b>探索与赌命消耗体力；遭遇原住民、陷阱与游戏失败会损失生命。生命归零时，只有拥有回响的人能带着记忆重生。</p>
      <p><b>5. 信念：</b>「念念不忘，必有回响。」——愿你活着走出终焉之地。</p>
      <div class="speed-help">
        <div>时间流速：</div>
        <button onclick="setSpeed(1)">×1（默认，1日=5分钟）</button>
        <button onclick="setSpeed(2)">×2</button>
        <button onclick="setSpeed(5)">×5</button>
        <button onclick="setSpeed(10)">×10</button>
      </div>
    </div>`;
}

/* --------------------------- 弹层 --------------------------- */
function showOverlay(html, dismissable) {
  const o = document.getElementById('overlay');
  o.innerHTML = `<div class="modal">${html}</div>`;
  o.classList.add('show');
  o.dataset.dismissable = dismissable ? '1' : '0';
}
function hideOverlay() {
  const o = document.getElementById('overlay');
  o.classList.remove('show');
  o.innerHTML = '';
}
function showEchoOverlay(e, isNew) {
  const verb = e.id === 'endless' ? '看到了' : '听到了';
  const line = `我${verb}「${e.name}」的回响${e.id === 'endless' ? '的激荡' : ''}`;
  const o = document.getElementById('overlay');
  o.innerHTML = `
    <div class="echo-awaken">
      <div class="echo-awaken-icon">${e.icon}</div>
      <div class="echo-awaken-line">${line}</div>
      <div class="echo-awaken-name">${e.name}${isNew ? '' : '（再度回响）'}</div>
      <div class="echo-awaken-flavor">「${e.flavor}」</div>
      <div class="echo-awaken-desc">${e.desc}</div>
      <div class="modal-actions"><button onclick="hideOverlay()">承 接 回 响</button></div>
    </div>`;
  o.classList.add('show');
  o.dataset.dismissable = '0';
}

/* --------------------------- 开场 / 速度 --------------------------- */
function setSpeed(s) { state.speed = s; bumpDirty(); renderHUD(); pushLog(`时间流速调整为 ×${s}。`, 'muted'); }

function showIntro() {
  showOverlay(`
    <h2 class="brand-modal">十 日 终 焉</h2>
    <p class="modal-sub">
      你在一间没有出口的空屋里醒来。<br>
      戴山羊面具的「人羊」告诉你：这里是 <b>终焉之地</b>，一座破败的城市。<br>
      参与者必须靠攻略游戏赚取筹码，才有一线机会逃离。<br><br>
      更要命的是——自你苏醒起，<b>只有十日</b>。第十一日，一切将被「大洗牌」。<br>
      唯有因「信念」觉醒 <b>回响</b> 的人，才能带着记忆进入下一次轮回。<br><br>
      <b>目标：集齐 ${CONFIG.TARGET_POINTS} 积分，通关。</b><br>
      每 ${CONFIG.ECHO_INTERVAL_DAYS} 日（现实 ${CONFIG.ECHO_INTERVAL_DAYS * CONFIG.DAY_REAL_SECONDS / 60} 分钟），你将觉醒一个回响。
    </p>
    <div class="modal-actions"><button onclick="startGame()">推 开 那 扇 门</button></div>`);
}
function startGame() {
  hideOverlay();
  if (!state.started) {
    state.started = true;
    pushLog('门在你身后合拢。终焉之地，开始了。', 'warn');
    pushLog('——「念念不忘，必有回响。」', 'echo-line');
  }
  lastTs = performance.now();
  bumpDirty();
}

/* --------------------------- 初始化 --------------------------- */
function init() {
  const loaded = load();
  if (loaded && state.started && !state.over) {
    pushLog('你从一个断续的梦境中醒来，继续这场轮回。', 'muted');
    lastTs = performance.now();
    hideOverlay();
  } else {
    if (loaded && state.over) state = defaultState();
    renderScene();
    showIntro();
  }
  // 按钮绑定
  document.querySelectorAll('.tabs button').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });
  document.getElementById('pauseBtn').addEventListener('click', () => { state.paused = !state.paused; bumpDirty(); });
  applyPassives();
  renderHUD(); renderTabs(); renderScene();
  lastTs = performance.now();
  setInterval(tick, 200);
}
window.addEventListener('DOMContentLoaded', init);
