/* ==========================================================
   北京中考英语 · 完形填空
   分值：8 小题 × 1 分 = 8 分

   【数据规范 · 解析准确性要求】
   每个空必须给：
     n       空号（与原文 ___（n）___ 对应，必须连续）
     options 四个选项
     answer  正确项索引
     why     为什么对——必须结合上下文逻辑（前文线索 / 后文呼应 / 搭配），
             不能只写「意思是…所以选它」

   【学习方法】
   完形不是「逐空选词」，而是「先通读抓主线，再回填」。
   北京卷 8 个空通常覆盖：动词 2–3、名词 1–2、形容词/副词 1–2、
   连词/介词 1、固定搭配 1。
   做完必须回读全文，检查逻辑是否通顺——这是丢分最多的地方。
   ========================================================== */

export const CLOZE = [
  {
    id: 'cloze-1',
    title: 'The Boy Who Fixed Bikes',
    level: '基础',
    topic: 'self-study',
    intro: '记叙文，主线是「从被帮助到帮助别人」。注意人物态度的转折。',
    passage: `When Jack was nine, his bike broke. His family was poor and could not buy him a new one. He sat on the step and cried.

An old man named Mr Lee lived next door. He came out and asked what was wrong. Then he said, "Bring it to my garage. Let me have a look."

Mr Lee ___(1)___ the bike for two hours. He showed Jack each part and told him its name. "You see," he said, "nothing is really broken. You just need to know how it works."

From that day, Jack spent every Saturday in Mr Lee's garage. He learned to fix brakes, chains and wheels. At first he only watched. Later he could do small jobs by himself. Mr Lee never asked for money, and Jack never ___(2)___ to say thank you.

When Jack was fifteen, Mr Lee became ill and could not work any more. Jack started to fix bikes for the children in his neighbourhood. He did not charge them, just as Mr Lee had never charged him. Some parents wanted to pay, but Jack always ___(3)___.

One afternoon, a small boy came with a broken bike and tears in his eyes. Jack looked at him and suddenly remembered ___(4)___ own first broken bike. He sat down on the step beside the boy and said, "Don't worry. Let me have a look."

The boy stopped crying and looked up. At that moment Jack understood something. Mr Lee had given him more than a skill. He had given him a way to ___(5)___ kindness.

Jack is now a bike mechanic. He still keeps the first tool Mr Lee gave him. On its handle there is a small word, written in the old man's hand: ___(6)___. Jack says he reads it every morning before he starts work.`,
    blanks: [
      { n: 1, options: ['bought', 'fixed', 'threw', 'hid'], answer: 1,
        why: '后文 Jack 学会了修刹车、链条、车轮，且本句说 Mr Lee 花了两个小时摆弄这辆车，说明他在「修」。buy 与开头「家里穷买不起」矛盾。' },
      { n: 2, options: ['forgot', 'wanted', 'needed', 'dared'], answer: 0,
        why: 'never forgot to say thank you = 从没忘记道谢，与「Mr Lee 从不收钱」形成呼应，体现 Jack 的感激。其他三项与 never 连用会变成否定感激之意，不合逻辑。' },
      { n: 3, options: ['agreed', 'refused', 'laughed', 'waited'], answer: 1,
        why: '前句说 Jack 给邻居孩子修车不收费，因此家长想付钱时他「拒绝」。just as Mr Lee had never charged him 是对 refused 的解释。' },
      { n: 4, options: ['her', 'his', 'their', 'its'], answer: 1,
        why: '此处指 Jack 自己那辆第一辆坏掉的自行车，主语是 Jack，用 his。这是物主代词的指代题。' },
      { n: 5, options: ['pass on', 'give up', 'take off', 'look for'], answer: 0,
        why: 'pass on kindness = 把善意传递下去。全文主线是「Mr Lee 帮他 → 他帮别人」，正是传递。give up 放弃、take off 起飞/脱下、look for 寻找均不合文意。' },
      { n: 6, options: ['Sorry', 'Hurry', 'Thanks', 'Quiet'], answer: 2,
        why: '老人留下的工具上刻着的话，应与全文「善意与感激」的主线一致。Jack 每天开工前读它，Thanks 呼应他对老人的感激，也呼应他把善意传下去的行为。' },
    ],
    translation: `Jack 九岁那年，自行车坏了。家里穷，买不起新的。他坐在台阶上哭。

隔壁住着一位叫 Lee 老先生的老人。他走出来问怎么了，然后说：「把车拿到我车库来，我看看。」

Lee 先生修了两个小时。他把每个零件指给 Jack 看，告诉他名字。「你看，」他说，「没有什么是真的坏了。你只是需要知道它是怎么运作的。」

从那天起，Jack 每个周六都泡在 Lee 先生的车库里。他学会了修刹车、链条和车轮。起初他只是看，后来能自己做些小活。Lee 先生从不收钱，Jack 也从没忘记说谢谢。

Jack 十五岁那年，Lee 先生病了，不能再干活。Jack 开始给街坊的孩子修车。他不收钱，就像 Lee 先生从不收他的钱一样。有些家长想付钱，Jack 总是拒绝。

一天下午，一个小男孩推着坏掉的自行车来，眼里含着泪。Jack 看着他，忽然想起了自己那辆第一辆坏车。他在男孩旁边的台阶上坐下，说：「别担心，我看看。」

男孩止住哭，抬起头。那一刻 Jack 明白了些什么。Lee 先生给他的不只是一门手艺，还给了他一个把善意传递下去的方式。

Jack 现在是自行车技师。他仍留着 Lee 先生给他的第一件工具。手柄上刻着一个词，是老人的笔迹：Thanks。Jack 说，他每天早上开工前都会读一遍。`,
  },
];

/* 第二篇：说明文型完形，8 空，对齐北京卷规格 */
CLOZE.push({
  id: 'cloze-2',
  title: 'The Village That Planted Trees',
  level: '重点',
  topic: 'nature-env',
  intro: '说明文，主线是「一个村庄用几十年改变环境」。注意时间线与因果。',
  passage: `In 1960, a village in the mountains of northern China had almost no trees. When it rained, the water ran down the hills and carried the soil away. Crops grew ___(1)___, and many families were hungry.

An old man named Wang decided to do something. He told the villagers, "If we plant trees on the hills, the soil will stay." Most people did not believe him. They said the hills were too dry and nothing would grow.

Wang did not argue. He took a basket of young trees and started climbing the hill alone. Every morning he ___(2)___ two hours digging holes and planting. In the first year, most of the trees died. In the second year, he tried again, this time choosing a kind of tree that needed ___(3)___ water.

Slowly, some villagers began to join him. By 1975, about forty people were planting trees every spring. They worked without pay, because they understood that the trees were for their children, not for ___(4)___.

Forty years later, the hills turned green. The soil stopped washing away. The river below the village, which had been muddy, became ___(5)___ again. Farmers could grow more crops, and young people who had left the village began to come back.

Wang died in 2008. On the hill where he planted his first tree, the villagers put up a small stone. It says: "He planted trees so that we could have a home." Every spring, the children of the village go up the hill and plant new trees. They are ___(6)___ what Wang started.

The village is now famous, and visitors come to see the green hills. But the villagers say the most important thing is not the visitors. It is that their children can drink clean water and breathe fresh air — the things that ___(7)___ money cannot buy.

When asked why he kept planting for forty years, Wang once said a simple sentence: "The best time to plant a tree was forty years ago. The second best time is ___(8)___.`,
  blanks: [
    { n: 1, options: ['quickly', 'badly', 'easily', 'safely'], answer: 1,
      why: '前文说雨水冲走土壤，后文说「许多家庭在挨饿」，说明庄稼长得「差」。badly 与前后的负面语境一致。' },
    { n: 2, options: ['spent', 'saved', 'wasted', 'found'], answer: 0,
      why: 'spend time doing sth 是固定搭配，意为「花两小时挖坑种树」。其他三项不能接「两小时 + 动名词」结构。' },
    { n: 3, options: ['more', 'less', 'clean', 'warm'], answer: 1,
      why: '前文说山太干、第一批树大多死了，所以第二次改选「需要更少水」的树种，这是针对失败原因的调整。' },
    { n: 4, options: ['him', 'them', 'us', 'themselves'], answer: 3,
      why: '句意是「树是为孩子种的，不是为自己」，主语是 they（村民），反身代词用 themselves，与 for their children 形成对照。' },
    { n: 5, options: ['dirty', 'clear', 'dry', 'wide'], answer: 1,
      why: '前文说河水原本是 muddy（浑浊的），种树后水土不再流失，河水重新变「清澈」，clear 与 muddy 构成反义对照。' },
    { n: 6, options: ['forgetting', 'continuing', 'stopping', 'changing'], answer: 1,
      why: '孩子们每年春天上山种树，是在「继续」王老汉开创的事。continuing 与后文 plant new trees 呼应。' },
    { n: 7, options: ['some', 'any', 'no', 'much'], answer: 2,
      why: '「干净的水和新鲜的空气是钱买不到的东西」，用 no money cannot buy 表达「再多钱也买不到」，强调其珍贵。' },
    { n: 8, options: ['tomorrow', 'yesterday', 'now', 'later'], answer: 2,
      why: '这是著名的谚语：「种树最好的时间是四十年前，第二好的时间是现在。」now 与前半句「四十年前」形成时间对照，是全篇的点睛句。' },
  ],
  translation: `1960 年，中国北方山区的一个村庄几乎没有树。一下雨，水就顺着山坡冲下来，把土带走。庄稼长得很差，许多家庭在挨饿。

一位姓王的老人决定做点什么。他对村民说：「如果我们在山上种树，土就能留住。」大多数人不相信。他们说山太干，什么都长不出来。

王老汉没有争辩。他背着一筐树苗，一个人开始爬山。每天早上他花两小时挖坑、种树。第一年，大部分树都死了。第二年他又试，这次选了一种需要更少水的树。

慢慢地，一些村民开始加入他。到 1975 年，每年春天大约有四十人一起种树。他们不要工钱，因为他们明白，这些树是给孩子的，不是给自己的。

四十年后，山变绿了。土不再流失。村下那条原本浑浊的河，又变清了。农民能种更多庄稼，外出打工的年轻人也开始回来。

王老汉 2008 年去世。在他种下第一棵树的山坡上，村民立了一块小石头，上面写着：「他种树，是为了让我们有个家。」每年春天，村里的孩子都会上山种新树。他们在继续王老汉开创的事业。

这个村庄如今出了名，游客来看绿色的山。但村民说，最重要的不是游客，而是他们的孩子能喝上干净的水、呼吸新鲜的空气——这些东西再多钱也买不到。

有人问王老汉为什么坚持种了四十年，他说过一句朴素的话：「种树最好的时间是四十年前，第二好的时间是现在。」`,
});
