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

Jack is now a bike mechanic. He still keeps the first tool Mr Lee gave him. On its handle there is a small word, written in the old man's hand: ___(6)___. Jack says he reads it every morning before he starts work.

Last year a television station came to interview him. The reporter asked ___(7)___ he had become a bike mechanic. Jack pointed at the old tool on the wall and told the story of Mr Lee. The reporter was surprised that Jack still remembered a man who had helped him so many years ___(8)___.`,
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
      { n: 7, options: ['how', 'why', 'when', 'where'], answer: 1,
        why: '记者问的是「他为什么成了自行车技师」，后文 Jack 指着旧工具讲起 Mr Lee 的故事，正是在回答「原因」。why 与后文的因果叙述一致。' },
      { n: 8, options: ['ago', 'later', 'before', 'after'], answer: 0,
        why: 'many years ago 是固定表达，意为「许多年前」。此处回忆多年前帮助过他的人，与 now（现在）形成时间对比；later 表示「之后」，方向相反。' },
    ],
    translation: `Jack 九岁那年，自行车坏了。家里穷，买不起新的。他坐在台阶上哭。

隔壁住着一位叫 Lee 老先生的老人。他走出来问怎么了，然后说：「把车拿到我车库来，我看看。」

Lee 先生修了两个小时。他把每个零件指给 Jack 看，告诉他名字。「你看，」他说，「没有什么是真的坏了。你只是需要知道它是怎么运作的。」

从那天起，Jack 每个周六都泡在 Lee 先生的车库里。他学会了修刹车、链条和车轮。起初他只是看，后来能自己做些小活。Lee 先生从不收钱，Jack 也从没忘记说谢谢。

Jack 十五岁那年，Lee 先生病了，不能再干活。Jack 开始给街坊的孩子修车。他不收钱，就像 Lee 先生从不收他的钱一样。有些家长想付钱，Jack 总是拒绝。

一天下午，一个小男孩推着坏掉的自行车来，眼里含着泪。Jack 看着他，忽然想起了自己那辆第一辆坏车。他在男孩旁边的台阶上坐下，说：「别担心，我看看。」

男孩止住哭，抬起头。那一刻 Jack 明白了些什么。Lee 先生给他的不只是一门手艺，还给了他一个把善意传递下去的方式。

Jack 现在是自行车技师。他仍留着 Lee 先生给他的第一件工具。手柄上刻着一个词，是老人的笔迹：Thanks。Jack 说，他每天早上开工前都会读一遍。

去年有家电视台来采访他。记者问他为什么成了自行车技师。Jack 指着墙上的旧工具，讲起了 Lee 先生的故事。记者很意外，Jack 竟然还记得许多年前帮过他的一个人。`,
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

/* 第三篇：记叙文型完形，8 空。题材「一次失败的演讲 → 学会面对紧张」，与现有两篇不重复 */
CLOZE.push({
  id: 'cloze-3',
  title: 'The Speech I Almost Gave Up',
  level: '重点',
  topic: 'self-life',
  intro: '记叙文，主线是「上台前的紧张 → 说出口之后的转变」。注意心理描写的词。',
  passage: `Last term, our English teacher asked me to give a speech at the school meeting. I said yes before I had time to think. Then I went home and could not sleep for two nights.

The problem was not the English. I had written the speech and read it aloud twenty times. The problem was the people. Every time I imagined standing in front of six hundred students, my hands went ___(1)___ and my mouth felt dry.

I told my father I wanted to give it up. He listened and then asked me one question: "What is the worst thing that can happen?" I thought about it for a long time. The worst thing was that I would forget my words. And then? People would ___(2)___ a little, and I would sit down, and the meeting would go on. Nobody would remember it a week later.

That answer did not make me brave. But it made me ___(3)___. On the morning of the meeting, my legs were still shaking when I walked to the front. I looked at the sea of faces and for a second I could not remember the first line.

Then I looked down at my paper, took a breath, and started. My voice was ___(4)___ at first, so soft that the students in the back could hardly hear me. But by the third sentence I began to feel something different. People were listening. Some of them were even smiling.

I finished two minutes later. There was a short silence, and then the hall was full of ___(5)___. I walked back to my seat and found that my shirt was wet through.

That afternoon, a girl from another class came to me and said she had wanted to speak at the meeting too, but she was ___(6)___ of the same thing. I told her what my father had told me. I told her the worst thing that could happen was much smaller than she thought.

I still do not enjoy speaking in public. But I no longer ___(7)___ it. I have learned that being afraid and doing it anyway are two different things, and the second one is ___(8)___ that changes you.`,
  blanks: [
    { n: 1, options: ['warm', 'cold', 'clean', 'strong'], answer: 1,
      why: '前文说「想到站在六百人面前」就睡不着，后文说「嘴发干」，都是紧张的生理反应。手「发凉」与嘴干并列，共同构成紧张的表现。' },
    { n: 2, options: ['laugh', 'leave', 'clap', 'shout'], answer: 0,
      why: '父亲让他想「最坏会怎样」：忘词后听众「笑一笑」，然后坐下，会照常进行。laugh a little 语气轻，说明事情没那么严重；clap 是正面反应，与「最坏」矛盾。' },
    { n: 3, options: ['proud', 'calm', 'angry', 'famous'], answer: 1,
      why: '紧接着说「这没有让我变勇敢，但让我____」，与 brave 形成让步关系——不是不怕了，而是心里「安定」下来。calm 与后文「深吸一口气再开口」呼应。' },
    { n: 4, options: ['loud', 'clear', 'low', 'happy'], answer: 2,
      why: '后文 so soft that the students in the back could hardly hear me 直接解释这个空：声音「低」。low 与 soft 同义复现，是典型的后文线索题。' },
    { n: 5, options: ['noise', 'music', 'anger', 'applause'], answer: 3,
      why: '讲完后「短暂的安静，然后大厅里充满了____」，紧接着说衬衫湿透，说明是紧张之后的放松。掌声（applause）是演讲结束的正面反馈。' },
    { n: 6, options: ['tired', 'afraid', 'fond', 'sure'], answer: 1,
      why: '女孩说她也想在会上发言，但「____同样的事」。全文都在讲「紧张、害怕」，be afraid of 是固定搭配，与前文 my hands went cold 呼应。' },
    { n: 7, options: ['enjoy', 'avoid', 'remember', 'forget'], answer: 1,
      why: '前句说「我仍然不喜欢当众讲话」，用 But 转折，后句说「不再____它」——即不再回避。avoid 与上句「不喜欢」形成「虽不喜欢但不再躲」的逻辑。' },
    { n: 8, options: ['it', 'one', 'this', 'that'], answer: 0,
      why: '此处指代前半句的 the second one（第二种做法：害怕但照做），用 it 指代这一件事，作 is 后的表语从句主语。that 通常指较远的事物，此处用 it 最自然。' },
  ],
  translation: `上个学期，英语老师让我在校会上做个演讲。我还没来得及想就答应了。然后我回家，两个晚上没睡着。

问题不在英语。稿子我写好了，也大声读过二十遍。问题在于人。每次我想到要站在六百名学生面前，手就发凉，嘴就发干。

我告诉父亲我想放弃。他听完，问了我一个问题：「最坏能坏到哪去？」我想了很久。最坏就是忘词。然后呢？大家笑一笑，我坐下，会照常开下去。一个星期后没人会记得。

那个答案没有让我变勇敢，但让我安定了下来。开会那天早上，我走向台前时腿还在抖。我看着台下的一片脸，有那么一秒，我想不起第一句。

然后我低头看稿，吸了口气，开始讲。一开始声音很低，低到后排几乎听不见。但说到第三句，我开始感觉到不一样——有人在听，有人甚至在笑。

两分钟后我讲完了。短暂的安静之后，大厅里响起掌声。我走回座位，发现衬衫已经湿透了。

那天下午，另一个班的一个女孩来找我，说她也想在会上发言，但害怕同样的事。我把父亲对我说的话告诉了她。我告诉她，最坏的事比她想的要小得多。

我仍然不喜欢当众讲话，但我不再回避它。我明白了，「害怕」和「害怕却照做」是两回事，而后者才是会改变你的那一个。`,
});

/* 第四篇：说明文型完形，8 空。题材「城市里的蜜蜂与屋顶花园」，与现有两篇不重复 */
CLOZE.push({
  id: 'cloze-4',
  title: 'Bees on the Roof',
  level: '难点',
  topic: 'nature-env',
  intro: '说明文，主线是「城市屋顶养蜂这件事：为什么做、怎么做、有什么用」。注意因果与数据。',
  passage: `When people think of bees, they usually think of the countryside. But in the past ten years, more and more bees have been living in cities — on the roofs of office buildings, hotels and schools.

The reason is simple. In the countryside, farmers often use chemicals to kill insects. These chemicals kill harmful insects, but they also kill bees. Cities are ___(1)___ for bees in one surprising way: there are fewer chemicals there.

City bees also have more food than people expect. Parks, gardens and even the small flowers on balconies give them something to eat all year round. A study in Paris found that city bees produced ___(2)___ honey per hive than bees in the countryside nearby.

Keeping bees on a roof is not as difficult as it sounds. A hive needs only a small space, about one square metre. The bees fly out in the morning and come back before dark. They do not need to be ___(3)___ every day, and they never hurt people who stay away from the hive.

Of course, there are rules. A beekeeper must make sure the bees have water nearby, so they do not go looking for it in other people's gardens. The hive must also be placed ___(4)___ from the door, so that people who are afraid of bees do not meet them by accident.

Why do companies want bees on their roofs? Some say it is good for their image. Others do it because their workers enjoy watching the bees. But the most important reason is ___(5)___: bees pollinate the plants around them, and more plants mean cleaner air and cooler streets.

Scientists are still studying ___(6)___ city bees do so well. Some believe it is the warmth of the buildings; others think it is the variety of flowers. What is clear is that the number of city hives is growing fast.

For the beekeepers, the work brings something else as well. Standing on a roof at sunset, listening to the low hum of a hundred thousand bees, many of them say they feel ___(7)___ than they have felt in years. It is a strange kind of peace, they say — one that no office meeting can give.

So the next time you look up at a tall building, remember: there may be a small city of bees living above your head, quietly doing the work that keeps our ___(8)___ alive.`,
  blanks: [
    { n: 1, options: ['worse', 'better', 'busier', 'colder'], answer: 1,
      why: '前文说乡下的农药会杀死蜜蜂，破折号后解释「城市里农药更少」，所以城市对蜜蜂来说「更好」。better 与前半段乡下对蜜蜂不利形成对比。' },
    { n: 2, options: ['less', 'more', 'dirtier', 'sweeter'], answer: 1,
      why: '前句说城市蜜蜂食物比人们想的更多（公园、花园、阳台的花），因此研究结果是「每箱产蜜更多」。more 与前句 more food 形成因果呼应。' },
    { n: 3, options: ['fed', 'moved', 'washed', 'counted'], answer: 0,
      why: '后文说蜜蜂早上飞出去、天黑前回来，自己找食，所以「不需要每天喂」。fed 与上文「城市里有的是花」呼应；moved / washed 与养蜂常识不符。' },
    { n: 4, options: ['far', 'near', 'high', 'close'], answer: 0,
      why: '后句说「让怕蜜蜂的人不会偶然碰到它们」，所以蜂箱要放在离门「远」的地方。far from 与后半句的目的形成因果。' },
    { n: 5, options: ['money', 'space', 'nature', 'safety'], answer: 2,
      why: '后文解释：蜜蜂给植物授粉，植物多意味着空气更干净、街道更凉——这些都是「自然」层面的好处。nature 概括了后面整句的内容。' },
    { n: 6, options: ['why', 'when', 'where', 'who'], answer: 0,
      why: '后文给出两种解释（建筑的温度、花的种类），说明科学家在研究「为什么」城市蜜蜂过得好。why 与后文 Some believe… others think… 呼应。' },
    { n: 7, options: ['busier', 'calmer', 'richer', 'luckier'], answer: 1,
      why: '后句说「这是一种奇怪的平静（peace）」，说明他们感到「更平静」。calmer 与 peace 同义复现，是明确的后文线索。' },
    { n: 8, options: ['city', 'farm', 'school', 'garden'], answer: 0,
      why: '全文讲的是城市屋顶养蜂，结尾回扣主题：蜜蜂在悄悄做着让「我们的城市」活下去的工作。city 与开头 cities 首尾呼应。' },
  ],
  translation: `人们想到蜜蜂，通常想到乡村。但在过去十年里，越来越多的蜜蜂住进了城市——在写字楼、酒店和学校的屋顶上。

原因很简单。在乡下，农民常使用化学药剂杀虫。这些药剂杀死害虫，也杀死了蜜蜂。城市在一个意想不到的方面对蜜蜂更友好：那里农药更少。

城市蜜蜂的食物也比人们想的要多。公园、花园，甚至阳台上的小花，一年四季都能给它们吃的。巴黎的一项研究发现，城市蜜蜂每箱产的蜜比附近乡下的蜜蜂更多。

在屋顶养蜂没有听起来那么难。一个蜂箱只要大约一平方米。蜜蜂早上飞出去，天黑前回来。它们不需要每天喂，也从不伤害远离蜂箱的人。

当然，也有规矩。养蜂人必须保证附近有水，这样蜜蜂不会去别人家的花园里找水。蜂箱还必须放在离门远的地方，免得怕蜜蜂的人不小心撞上。

公司为什么愿意在屋顶养蜂？有的说对形象有好处，有的说员工喜欢看蜜蜂。但最重要的原因是自然：蜜蜂为周围的植物授粉，植物多了，空气更干净，街道更凉快。

科学家还在研究城市蜜蜂为什么过得这么好。有人认为是建筑的温度，有人认为是花的种类多。清楚的是，城市蜂箱的数量正在快速增长。

对养蜂人来说，这份工作还带来别的东西。日落时站在屋顶上，听着十万只蜜蜂低低的嗡鸣，很多人说他们多年来从没这么平静过。他们说，这是一种奇怪的安宁——任何会议都给不了。

所以下次你抬头看一栋高楼时，请记得：你头顶上可能住着一个小小的蜜蜂城市，正安静地做着让我们的城市活下去的工作。`,
});
