/* ==========================================================
   北京中考英语 · 书面表达
   分值：1 题 10 分（笔试第五部分，通常要求 80–100 词）

   【数据规范】
     id / level / type / title
     prompt    题目要求（含 3 个内容要点）
     given     已给出的开头结尾（不计入词数）
     outline   写作提纲（每段写什么）
     keyPoints 必备句式（en + zh，可直接套用）
     model     范文（可选；页面已不展示，范文留给学生自己写，保留字段备日后恢复）
     tips      评分要点（讲清「为什么这样写能得分」）

   【学习方法】
   10 分写作的评分逻辑是三维度：
     ① 内容要点齐全（题目要求的每条都写到）—— 这是硬分
     ② 语言准确通顺（时态、人称、拼写）
     ③ 结构连贯得体（有开头结尾，用连接词分层）
   提分优先级：先写全要点 → 再改语言错误 → 最后追求高级句式。
   ========================================================== */

export const WRITING = [
  {
    id: 'w1', level: '基础', type: '应用文·通知', structId: 'notice', title: '写一则英语角通知',
    scene: '英语角活动通知：学生会向全校同学发布活动安排。',
    prompt: '假定你是学生会主席李华。学校将于下周五下午举办英语角活动，请你用英语写一则通知。内容包括：\n1. 活动时间与地点；\n2. 活动内容（如英语歌曲、短剧表演、自由交流）；\n3. 邀请同学们参加。\n\n注意：1. 词数 80–100；2. 开头和结尾已给出，不计入总词数。',
    given: 'Boys and girls,\n\nMay I have your attention, please?\n\n______________________\n\nThank you.\n\nThe Students\' Union',
    outline: [
      '第一段：说明活动时间、地点（下周五下午 3 点，学校礼堂）',
      '第二段：介绍活动内容（唱英语歌、演短剧、与外教自由交流）',
      '第三段：号召参加，说明意义（提高口语、交朋友）',
    ],
    keyPoints: [
      { en: 'be going to be held / take place', zh: '将举办（通知必备）' },
      { en: 'in the school hall', zh: '在学校礼堂' },
      { en: 'sing English songs and put on short plays', zh: '唱英语歌、演短剧' },
      { en: 'communicate with foreign teachers', zh: '与外教交流' },
      { en: 'improve your spoken English', zh: '提高英语口语' },
      { en: 'make new friends', zh: '结交新朋友' },
      { en: 'take an active part in', zh: '积极参加' },
      { en: 'We are looking forward to seeing you there.', zh: '期待见到你（结尾句）' },
    ],
    model: `Boys and girls,

May I have your attention, please?

Our school is going to hold an English Corner next Friday afternoon. It will take place in the school hall from 3:00 to 5:00.

At the English Corner, you can sing English songs, put on short plays and talk with our foreign teachers. Everyone can practise speaking English in a relaxed way.

I hope you will take an active part in it. It is a good chance to improve your spoken English and make new friends. We are looking forward to seeing you there.

Thank you.

The Students' Union`,
    highlights: [
      { en: 'Our school is going to hold an English Corner next Friday afternoon.', zh: '用 be going to 表将来，一句话交代事件与时间，是通知的开场标准写法。' },
      { en: 'It will take place in the school hall from 3:00 to 5:00.', zh: '时间 + 地点用一句说全；take place 比 have 更正式，适合通知文体。' },
      { en: 'It is a good chance to improve your spoken English and make new friends.', zh: '用 It is a good chance to… 把「意义」写出来，是通知争取参与者的高分句式。' },
      { en: 'We are looking forward to seeing you there.', zh: 'look forward to doing 是固定搭配，结尾用它比 Please come 得体得多。' },
    ],
    tips: [
      '通知必须有称呼和 "May I have your attention, please?" 这类提示语——这是应用文的格式分，缺了就丢。',
      '时间地点要写全：next Friday afternoon + school hall + 3:00 to 5:00。只写「下周五」不写具体时段，内容分会被扣。',
      '题目给了 3 个要点，就必须出现 3 个对应句子，一一对应。阅卷时是「按点给分」。',
      '结尾用 "I hope…" 或 "We are looking forward to…" 收束，比干巴巴的 "Please come." 更得体。',
      '全文用一般将来时（is going to / will），不要混用过去时。',
    ],
  },
  {
    id: 'w2', level: '重点', type: '应用文·书信', structId: 'letter', title: '给外国笔友回信介绍北京',
    scene: '回信介绍北京：笔友寒假来京，需要你介绍景点与建议。',
    prompt: '你的英国笔友 Peter 打算寒假来北京旅游，来信询问北京的情况。请你给他回一封信，内容包括：\n1. 推荐一个你认为最值得去的地方，并说明理由；\n2. 提醒他来北京需要注意的一件事（如天气、交通、饮食）；\n3. 表示欢迎并期待见面。\n\n注意：1. 词数 80–100；2. 开头和结尾已给出，不计入总词数。',
    given: 'Dear Peter,\n\nI\'m very glad to hear that you are coming to Beijing this winter.\n\n______________________\n\nBest wishes,\n\nLi Hua',
    outline: [
      '第一段：表示欢迎，点明推荐地点（如长城 / 故宫）',
      '第二段：说明推荐理由（历史、景色、拍照）',
      '第三段：提醒注意事项（冬天很冷，多带衣服）',
      '第四段：期待见面',
    ],
    keyPoints: [
      { en: 'I\'m glad to hear that…', zh: '很高兴听说…（回应来信）' },
      { en: 'the best place to visit', zh: '最值得去的地方' },
      { en: 'the Great Wall / the Palace Museum', zh: '长城 / 故宫' },
      { en: 'It has a history of more than two thousand years.', zh: '它有两千多年历史' },
      { en: 'You\'d better bring some warm clothes.', zh: '你最好带些厚衣服' },
      { en: 'It is very cold in winter here, sometimes below zero.', zh: '这里冬天很冷，有时零下' },
      { en: 'I\'m looking forward to seeing you.', zh: '期待见到你' },
    ],
    model: `Dear Peter,

I'm very glad to hear that you are coming to Beijing this winter.

If you ask me which place is worth visiting most, I would say the Great Wall. It is one of the most famous places in the world, and it has a history of more than two thousand years. Standing on the wall, you can enjoy a wonderful view. I'm sure you will love it.

By the way, it is very cold here in winter, sometimes below zero. So you'd better bring some warm clothes and comfortable shoes.

I can't wait to see you. I will show you around the city.

Best wishes,

Li Hua`,
    highlights: [
      { en: "I'm glad to hear that you are coming to Beijing this winter holiday.", zh: '回信开头用 I\'m glad to hear that… 承接来信，是最自然得体的起句。' },
      { en: 'Beijing is a city with a long history and many places of interest.', zh: 'with 短语作后置定语，一句话把「历史 + 景点」两个要点压缩进同一句。' },
      { en: 'You can visit the Great Wall, which is famous all over the world.', zh: '非限制性定语从句补充说明，让句子信息量变大又不啰嗦。' },
      { en: 'I hope you will have a wonderful time here.', zh: '结尾祝愿句，把「期待」落到对方身上，比 I hope you like it 更具体。' },
    ],
    tips: [
      '书信要有「回应来信」的句子（I\'m glad to hear that…）——这是书信体的交际功能分，不是可有可无的客套。',
      '推荐理由要具体：history / view / photos 三点，比只说 "It is beautiful." 更容易拿高分。',
      '提醒事项用 You\'d better… 比 You must… 更礼貌，符合给朋友建议的语气。',
      '注意时态：介绍长城用一般现在时，谈将来的行程用一般将来时。',
      '结尾 "I can\'t wait to see you." 是地道表达，比 "I want to see you soon." 更自然。',
    ],
  },
  {
    id: 'w3', level: '重点', type: '议论文·观点', structId: 'opinion', title: '谈谈中学生该不该做家务',
    scene: '投稿议论文：就「中学生该不该做家务」表明观点并说明理由。',
    prompt: '某英文报社正在开展讨论：中学生应不应该做家务？请你写一篇短文投稿，内容包括：\n1. 你的观点；\n2. 两条支持你观点的理由；\n3. 你平时做的家务及感受。\n\n注意：1. 词数 80–100；2. 文中不得出现真实姓名和校名。',
    given: '',
    outline: [
      '第一段：亮明观点（我认为中学生应该做家务）',
      '第二段：理由一（培养独立性）+ 理由二（体谅父母）',
      '第三段：自己做的家务与感受，总结',
    ],
    keyPoints: [
      { en: 'In my opinion, …', zh: '在我看来（亮观点的标准句式）' },
      { en: 'learn to be independent', zh: '学会独立' },
      { en: 'understand how hard our parents work', zh: '理解父母多辛苦' },
      { en: 'help with the housework', zh: '帮忙做家务' },
      { en: 'do the dishes / sweep the floor / take out the rubbish', zh: '洗碗 / 扫地 / 倒垃圾' },
      { en: 'feel proud of myself', zh: '为自己感到自豪' },
      { en: 'It is our duty to…', zh: '…是我们的责任' },
      { en: 'In a word, …', zh: '总之（总结段起首）' },
    ],
    model: `Should middle school students do housework? In my opinion, the answer is yes.

First, doing housework helps us learn to be independent. If we learn to cook and clean, we can take care of ourselves in the future. Second, it helps us understand how hard our parents work. Keeping a home tidy is never easy.

As for me, I often help my mother do the dishes and take out the rubbish at weekends. Although it takes only a few minutes, I feel proud of myself.

In a word, doing housework is our duty and a good way to grow up.`,
    highlights: [
      { en: 'In my opinion, middle school students should do some housework at home.', zh: 'In my opinion 直接亮明观点，议论文第一句就该让读者知道你站哪边。' },
      { en: 'First, doing housework helps us learn to look after ourselves.', zh: 'First 引出第一条理由，动名词短语作主语，是议论文的标准骨架句。' },
      { en: 'Second, it can make us understand how hard our parents work.', zh: 'Second 引出第二条理由；how hard 引导宾语从句，比 our parents work hard 更自然。' },
      { en: 'In a word, doing housework is not a waste of time but a way to grow up.', zh: 'In a word 收束全文，用 not…but… 对比结构升华，是议论文的高分结尾。' },
    ],
    tips: [
      '议论文结构要清晰：亮观点 → 两条理由 → 自身例子 → 总结。阅卷老师一眼能看到层次，就是「结构分」。',
      '理由用 First… Second… 明确标号，比混在一段里更容易得分。',
      '「自身例子」这一段是题目明确要求的要点，不能省略——很多人只写观点和理由就交了。',
      '结尾用 In a word 收束并升华（not a waste of time / a way to grow up），是议论文的高分写法。',
      '注意：题目说「不得出现真实姓名和校名」，用 As for me 这类说法回避，不要写出自己的真名。',
    ],
  },
  {
    id: 'w4', level: '难点', type: '应用文·申请信', structId: 'apply', title: '写一封志愿者申请信',
    scene: '申请信：向负责老师申请成为国际文化节志愿者。',
    prompt: '假定你是李华，你校正在招募国际文化节的志愿者。请你给负责老师 Mr Smith 写一封申请信，内容包括：\n1. 你申请的原因；\n2. 你的优势（如英语水平、相关经验）；\n3. 你希望能承担的工作。\n\n注意：1. 词数 80–100；2. 开头和结尾已给出，不计入总词数。',
    given: 'Dear Mr Smith,\n\nI am Li Hua, a student from Class 3, Grade 9. I am writing to apply to be a volunteer for the International Culture Festival.\n\n______________________\n\nYours sincerely,\n\nLi Hua',
    outline: [
      '第一段（已给）：表明身份与写信目的',
      '第二段：申请原因 + 两项优势（英语好、有经验）',
      '第三段：希望承担的工作（接待外宾 / 翻译）',
      '第四段：表达期待与感谢',
    ],
    keyPoints: [
      { en: 'I am writing to apply to be…', zh: '我写信申请成为…（申请信开头）' },
      { en: 'I am good at spoken English', zh: '我擅长英语口语' },
      { en: 'I have experience in…', zh: '我在…方面有经验' },
      { en: 'Last year, I helped…', zh: '去年我帮忙…（举例证明）' },
      { en: 'I would like to be responsible for…', zh: '我希望负责…' },
      { en: 'show foreign guests around our school', zh: '带外宾参观学校' },
      { en: 'I would appreciate it if you could give me the chance.', zh: '如果您能给我这个机会，我将不胜感激' },
    ],
    model: `Dear Mr Smith,

I am Li Hua, a student from Class 3, Grade 9. I am writing to apply to be a volunteer for the International Culture Festival.

There are two reasons why I would like to join you. First, I am good at spoken English and won the first prize in our school's speech contest. Second, I have experience in helping guests. Last year, I showed some Australian students around our school.

If I am chosen, I would like to welcome foreign guests and help them find their way. I am also willing to do translation work if needed.

I would appreciate it if you could give me the chance.

Yours sincerely,

Li Hua`,
    highlights: [
      { en: 'I am writing to apply to be a volunteer for the International Culture Festival.', zh: 'I am writing to… 是申请信的标准开场，一句话点明写信目的。' },
      { en: 'I think I am fit for this job because I am good at English.', zh: 'be fit for + be good at 两个短语连用，把「申请理由 + 优势」写在一句里。' },
      { en: 'Last year I helped at the school sports meeting, so I have some experience.', zh: '用具体经历证明优势，比空说 I am helpful 有说服力得多。' },
      { en: 'I would appreciate it if you could give me this chance.', zh: 'I would appreciate it if… 是申请信最得体的请求句式，礼貌又高级。' },
    ],
    tips: [
      '申请信的三个要素必须齐全：申请原因、个人优势、希望承担的岗位。缺一项就丢内容分。',
      '「优势」不能只说 I am good at English，要用事实支撑（获奖、去年做过什么）——这是 9 分与 7 分的差别。',
      '希望承担的工作要具体（接待外宾 / 翻译），比笼统的 "I can do anything" 更能体现诚意。',
      '注意礼貌用语：I would appreciate it if you could… 是申请信的高分句式。',
      '全文以一般现在时为主，谈「如果被选中」时用 would like to，注意语气分寸。',
    ],
  },
];

/* ==========================================================
   以下 4 篇为补充的高分范文（对齐河北项目的 8 篇规格）
   体裁与现有 4 篇不重复：发言稿 / 倡议书 / 日记 / 邀请信
   ========================================================== */
WRITING.push(
  {
    id: 'w5', level: '重点', type: '应用文·发言稿', structId: 'opinion', title: '在英语班会上谈「我为学校骄傲」',
    scene: '英语班会上，老师请同学们以 Proud of My School 为题发言。',
    prompt: '假设你是李华，英语班会上老师请同学们以 Proud of My School 为题发言。请你写一篇发言稿，内容包括：\n1. 学校最美的地方；\n2. 你最喜欢的一门课或一位老师；\n3. 你对学校的祝愿。\n\n注意：1. 词数 80–100；2. 开头和结尾已给出，不计入总词数。',
    given: 'Good morning, everyone.\n\n______________________\n\nThank you.',
    outline: [
      '第一段：点题 + 学校最美之处（一句话带出）',
      '第二段：具体写课程或老师（用细节，不要空泛）',
      '第三段：祝愿 + 收束（呼应开头）',
    ],
    keyPoints: [
      { en: 'I want to talk about why I am proud of…', zh: '点题（why 引导宾语从句）' },
      { en: 'The most beautiful place in our school is…', zh: '最高级点出「最美的地方」' },
      { en: 'What I love most is…', zh: '「我最喜欢的是…」（what 引导主语从句）' },
      { en: 'never makes us afraid of making mistakes', zh: '从不让我们害怕犯错' },
      { en: 'a place where students feel safe to try', zh: '一个学生敢于尝试的地方（where 定语从句）' },
      { en: 'I hope our school will always be…', zh: '祝愿句（结尾）' },
    ],
    model: `Good morning, everyone. Today I want to talk about why I am proud of our school.

The most beautiful place in our school is the library. It has large windows, and in the afternoon the sunlight falls on the desks. The room is so quiet that I can hear the pages turning.

What I love most is our English class. Ms. Wang never makes us afraid of making mistakes. She says a mistake is just a step on the way to being right.

I hope our school will always be a place where students feel safe to try. Thank you.`,
    highlights: [
      { en: 'Today I want to talk about why I am proud of our school.', zh: '点题句：用 why 引导宾语从句，直接亮出主题，不绕弯。' },
      { en: 'the sunlight falls on the desks', zh: '细节描写：不说「图书馆很美」，而是写阳光落在桌上，画面感一下就出来了。' },
      { en: 'so quiet that I can hear the pages turning', zh: 'so…that 结果状语从句，用「听见翻页声」侧面写安静，比直接说 quiet 高明。' },
      { en: 'She says a mistake is just a step on the way to being right.', zh: '高分句：用比喻把抽象道理讲具体，是拉开档次的写法。' },
      { en: 'I hope our school will always be a place where students feel safe to try.', zh: '收束句：where 引导定语从句，把主题从「学校」升华到「敢尝试」。' },
    ],
    tips: [
      '发言稿必须有称呼（Good morning, everyone.）和致谢（Thank you.），这是格式分。',
      '三个提示点必须一一对应：最美之处、课程或老师、祝愿。漏一个就降档。',
      '「最美之处」不要只写 beautiful，要写具体细节（阳光、声音、气味）——这是 8 分与 10 分的差别。',
      '全文用一般现在时（学校是常态），祝愿句用 will，时态不要串。',
    ],
  },
  {
    id: 'w6', level: '重点', type: '应用文·倡议书', structId: 'proposal', title: '写一篇节约用水的倡议书',
    scene: '你班要出一期「节约用水」主题黑板报，需要一篇倡议书。',
    prompt: '假设你是班长李华，你班要出一期以「节约用水」为主题的黑板报。请你写一篇倡议书，内容包括：\n1. 为什么要节约用水；\n2. 同学们可以怎么做（至少两条）；\n3. 发出号召。\n\n注意：1. 词数 80–100；2. 开头和结尾已给出，不计入总词数。',
    given: 'Dear classmates,\n\n______________________\n\nThe Students\' Union',
    outline: [
      '第一段：点明问题——水很宝贵，但浪费随处可见',
      '第二段：给出 2 条具体做法（关紧水龙头、重复利用水）',
      '第三段：号召大家一起行动',
    ],
    keyPoints: [
      { en: 'Water is precious, but…', zh: '水很宝贵，但是…（转折点题）' },
      { en: 'turn off the tap in time', zh: '及时关紧水龙头' },
      { en: 'reuse the water for…', zh: '把水重复利用于…' },
      { en: 'Every small action makes a difference.', zh: '每个小行动都有意义（倡议常用）' },
      { en: 'Let\'s take action right now.', zh: '让我们现在就行动起来（号召句）' },
    ],
    model: `Dear classmates,

Water is precious, but we often forget it. In our school, taps are often left running, and half-full bottles are thrown away.

There are simple things we can do. First, turn off the tap in time and make sure it is not dripping. Second, reuse water whenever possible — the water used to wash vegetables can be used to clean the floor.

Saving water is not a big thing for one person, but it is a big thing for all of us. Let's take action right now, starting from the tap in our own classroom.

The Students' Union`,
    highlights: [
      { en: 'taps are often left running, and half-full bottles are thrown away', zh: '用两个具体细节（长流的水龙头、剩半瓶的水）代替空泛的 we waste water，画面感强。' },
      { en: 'half-full bottles are thrown away', zh: 'half-full 一个复合形容词就写出「没喝完就扔」，比 a lot of water is wasted 精确。' },
      { en: 'First… Second…', zh: '分点用序数词，阅卷老师一眼看到两条做法，结构分稳拿。' },
      { en: 'Saving water is not a big thing for one person, but it is a big thing for all of us.', zh: '对偶 + 转折，把「个人小事」和「集体大事」对照，是倡议书的高分句。' },
      { en: "Let's take action right now, starting from the tap in our own classroom.", zh: '号召句落到具体动作（教室的水龙头），比空喊口号有力。' },
    ],
    tips: [
      '倡议书要有称呼和落款，缺一个就丢格式分。',
      '「为什么节约」不要写成大段说教，用一两个身边细节（没关的水龙头、剩半瓶的水）就够了。',
      '做法至少写两条，用 First / Second 明确标号，方便阅卷老师按点给分。',
      '结尾的号召要具体，落到「教室的水龙头」比「请大家节约用水」更有说服力。',
    ],
  },
  {
    id: 'w7', level: '基础', type: '记叙文·日记', structId: 'diary', title: '写一篇参观博物馆的日记',
    scene: '学校组织参观博物馆，请写一篇日记。',
    prompt: '假设你是李华，今天学校组织参观了中国科学技术馆。请你用英语写一篇日记，内容包括：\n1. 今天去了哪里、和谁一起；\n2. 你看到了什么、做了什么；\n3. 你的感受。\n\n注意：1. 词数 80–100；2. 日记格式已给出，不计入总词数。',
    given: 'Sunday, June 15   Sunny\n\n______________________',
    outline: [
      '第一段：交代时间、地点、同行的人',
      '第二段：写看到的展品与亲手体验的项目（用细节）',
      '第三段：写感受与收获',
    ],
    keyPoints: [
      { en: 'Today our class visited…', zh: '今天我们班参观了…' },
      { en: 'What impressed me most was…', zh: '最让我印象深刻的是…（what 主语从句）' },
      { en: 'I tried… with my own hands', zh: '我亲手试了…' },
      { en: 'It made me realize that…', zh: '这让我意识到…（感受句）' },
      { en: 'What a meaningful day!', zh: '多么有意义的一天！（感叹收尾）' },
    ],
    model: `Sunday, June 15   Sunny

Today our class visited the China Science and Technology Museum. We arrived at nine in the morning.

What impressed me most was a room about space. I tried to pick up a "stone" with a special glove, just like an astronaut. It looked easy, but my fingers could hardly hold anything. Later I watched a robot play the piano, and it played better than I do.

On the way back, I kept thinking about the visit. Science is not only in books — it is something you can touch and try. What a meaningful day!`,
    highlights: [
      { en: 'What impressed me most was a room about space.', zh: 'what 引导主语从句 + 最高级，一句话点出全文重点，日记的高分开头。' },
      { en: 'tried to pick up a "stone" with a special glove, just like an astronaut', zh: '具体动作 + 比喻（just like an astronaut），把体验写得可感。' },
      { en: 'It looked easy, but my fingers could hardly hold anything.', zh: '「看着容易、做起来难」的对比，用 hardly 体现真实感受，不是空夸。' },
      { en: 'it played better than I do', zh: '比较级 + 自嘲，读起来自然有趣，比 it was wonderful 生动得多。' },
      { en: 'science is not only in books — it is something you can touch and try.', zh: 'not only…but 的变体 + 破折号解释，收束有思想深度。' },
    ],
    tips: [
      '日记必须有日期、星期、天气三要素（题目已给），正文用第一人称、过去时。',
      '不要写成流水账「我们看了 A，又看了 B」。挑一件最难忘的写细，其余一句带过。',
      '写感受要具体：「科学不只在书里，还能摸到」比「我学到了很多」有分量。',
      '结尾可用感叹句收束（What a meaningful day!），日记里很自然。',
    ],
  },
  {
    id: 'w8', level: '难点', type: '应用文·邀请信', structId: 'letter', title: '邀请外教参加英语角',
    scene: '你们班将举办英语角活动，想邀请外教 Ms. Green 参加。',
    prompt: '假设你是李华，你们班将于本周五下午举办英语角活动，想邀请外教 Ms. Green 参加。请你给她写一封邀请信，内容包括：\n1. 活动的时间、地点与主题；\n2. 希望她做什么（如做简短发言、与学生交流）；\n3. 表达期待。\n\n注意：1. 词数 80–100；2. 开头和结尾已给出，不计入总词数。',
    given: 'Dear Ms. Green,\n\n______________________\n\nYours sincerely,\nLi Hua',
    outline: [
      '第一段：说明写信目的——邀请她参加英语角',
      '第二段：交代时间、地点、主题，以及希望她做的事',
      '第三段：表达期待与感谢',
    ],
    keyPoints: [
      { en: 'I am writing to invite you to…', zh: '写信目的（邀请信标准开场）' },
      { en: 'It will be held in… on…', zh: '活动时间地点（被动语态）' },
      { en: 'We would be grateful if you could…', zh: '礼貌请求（虚拟语气）' },
      { en: 'share your experience with us', zh: '和我们分享你的经历' },
      { en: 'We are looking forward to your reply.', zh: '期待回复（结尾句）' },
    ],
    model: `Dear Ms. Green,

I am writing to invite you to our English Corner this Friday afternoon. The topic is "My Favourite Book", and we all thought of you at once.

The activity will be held in Room 302 from 3:00 to 4:30. We would be grateful if you could give us a short talk about a book you love, and then talk with us in small groups. Your ideas always make us see things in a new way.

We know you are busy, but we do hope you can come. We are looking forward to your reply.

Yours sincerely,
Li Hua`,
    highlights: [
      { en: 'I am writing to invite you to our English Corner this Friday afternoon.', zh: '邀请信标准开场，一句话交代「写信目的 + 活动 + 时间」。' },
      { en: 'we all thought of you at once', zh: '一句「我们立刻想到了您」，把邀请写得真诚，比 I hope you can come 有温度。' },
      { en: 'We would be grateful if you could give us a short talk…', zh: '虚拟语气表达礼貌请求，是邀请信拉开档次的关键句式。' },
      { en: 'Your ideas always make us see things in a new way.', zh: '具体夸赞（让我们换个角度看问题），比 You are a good teacher 得体得多。' },
      { en: 'We know you are busy, but we do hope you can come.', zh: '先体谅再请求，用 do 强调，分寸感好，不显得强人所难。' },
    ],
    tips: [
      '邀请信三要素：说明目的、交代细节（时间地点主题）、表达期待，缺一不可。',
      '「希望她做什么」要具体：做简短发言 + 分小组交流，比「来参加一下」显得有准备。',
      '礼貌请求用 We would be grateful if you could…，比 Please come 得体得多。',
      '结尾要表达期待并致谢，注意落款用 Yours sincerely，署名 Li Hua。',
    ],
  },
);

/* ==========================================================
   写作通用方法论：技巧 / 结构模板 / 句型库
   这些是「换什么题都能用」的底层内容，
   与具体篇目的写作练习互补（练习只给题目与提纲，不附范文）。
   ========================================================== */

/* 一、写作五步法 */
export const WRITING_STEPS = [
  {
    n: 1, t: '审题划要点',
    d: '把题目要求拆成编号要点（通常 3 条）。每个要点在草稿上写一个中文关键词，写完逐条打勾——这是内容分，漏一条就丢分。',
    tip: '北京卷写作的要点是「按点给分」的，不是「整体感觉」。',
  },
  {
    n: 2, t: '定时态人称',
    d: '先确定全文用什么时态：介绍/通知用一般现在时或将来时，记叙往事用一般过去时。人称也要先定（I / we / you）。',
    tip: '时态混用是最大的失分点，比单词拼错扣得多。',
  },
  {
    n: 3, t: '搭三段框架',
    d: '第一段点题（我是谁、为什么写），第二段主体（2–3 个要点各一句），第三段收尾（期待、感谢、呼吁）。',
    tip: '三段式最稳。阅卷老师扫一眼能看到层次，就是结构分。',
  },
  {
    n: 4, t: '套句式写正文',
    d: '用背熟的句式搭骨架（First… Second… Besides…），再填具体内容。不要临场造复杂句，简单句写对就是好句。',
    tip: '宁可用对的一般句，也不用错的从句。',
  },
  {
    n: 5, t: '查三样东西',
    d: '① 要点齐不齐；② 动词形式对不对（第三人称单数、时态、被动）；③ 名词单复数与冠词。',
    tip: '留 3 分钟专门检查这三项，能救回 1–2 分。',
  },
];

/* 二、常见结构模板 */
export const WRITING_STRUCTURES = [
  {
    id: 'notice', name: '通知', icon: '📢',
    use: '学校活动、社团招新、讲座安排',
    blocks: [
      { label: '称呼 + 提示语', en: 'Boys and girls, / May I have your attention, please?' },
      { label: '活动是什么、何时何地', en: 'Our school is going to hold … It will take place in … from … to ….' },
      { label: '活动内容（2–3 项）', en: 'At the …, you can … and …. There will also be ….' },
      { label: '号召参加 + 意义', en: 'I hope you will take an active part in it. It is a good chance to ….' },
      { label: '落款', en: 'The Students\' Union' },
    ],
  },
  {
    id: 'letter', name: '书信 / 回信', icon: '✉️',
    use: '给笔友回信、给老师写信、邀请信',
    blocks: [
      { label: '问候 + 回应来信', en: 'Dear …, I\'m very glad to hear that ….' },
      { label: '主体一：回答对方的问题', en: 'You asked about …. Well, ….' },
      { label: '主体二：补充建议或提醒', en: 'By the way, you\'d better …. / One more thing, ….' },
      { label: '期待 + 结尾', en: 'I\'m looking forward to seeing you. / I can\'t wait to ….' },
      { label: '落款', en: 'Best wishes, / Yours, + Li Hua' },
    ],
  },
  {
    id: 'opinion', name: '议论文 / 观点', icon: '💬',
    use: '该不该做某事、如何看待某现象',
    blocks: [
      { label: '亮明观点', en: 'In my opinion, … / I think … is a good idea.' },
      { label: '理由一', en: 'First, … helps us …. For example, ….' },
      { label: '理由二', en: 'Second, … allows us to ….' },
      { label: '自身例子', en: 'As for me, I often …. Although …, I feel ….' },
      { label: '总结升华', en: 'In a word, … is not a waste of time. It is ….' },
    ],
  },
  {
    id: 'apply', name: '申请信', icon: '📝',
    use: '申请志愿者、社团、比赛',
    blocks: [
      { label: '身份 + 目的', en: 'I am Li Hua, a student from …. I am writing to apply to be ….' },
      { label: '申请原因', en: 'There are two reasons why I would like to join you.' },
      { label: '优势一（带事实）', en: 'First, I am good at …. Last year, I ….' },
      { label: '优势二 / 希望承担的工作', en: 'Second, I have experience in …. If I am chosen, I would like to ….' },
      { label: '礼貌收尾', en: 'I would appreciate it if you could give me the chance.' },
    ],
  },
  {
    id: 'proposal', name: '倡议书', icon: '🌱',
    use: '节约用水、保护环境、光盘行动、文明上网',
    blocks: [
      { label: '称呼 + 指出问题', en: 'Dear classmates, … is precious, but we often forget it.' },
      { label: '具体做法一', en: 'First, turn off the tap in time and make sure it is not dripping.' },
      { label: '具体做法二', en: 'Second, reuse water whenever possible.' },
      { label: '号召行动', en: 'Let\'s take action right now, starting from ….' },
      { label: '落款', en: 'The Students\' Union / Li Hua' },
    ],
  },
  {
    id: 'diary', name: '日记 / 经历', icon: '📔',
    use: '记一次活动、一次难忘的经历、一天的生活',
    blocks: [
      { label: '日期 + 星期 + 天气', en: 'Sunday, June 15   Sunny' },
      { label: '交代时间地点人物', en: 'Today our class visited …. We arrived at ….' },
      { label: '最难忘的一件事（写细节）', en: 'What impressed me most was …. I tried to ….' },
      { label: '感受与收获', en: 'It made me realize that …. / I learned that ….' },
      { label: '感叹收尾', en: 'What a meaningful day!' },
    ],
  },
];

/* 三、句型库（按功能分类，可直接套用） */
export const WRITING_PHRASES = [
  {
    fn: '开头点题', icon: '🚩',
    items: [
      { en: 'I am writing to tell you about …', zh: '我写信是想告诉你关于…' },
      { en: 'I\'m very glad to hear that …', zh: '很高兴听说…（回信必备）' },
      { en: 'Our school is going to hold …', zh: '我们学校将举办…（通知）' },
      { en: 'In my opinion, …', zh: '在我看来…（议论）' },
    ],
  },
  {
    fn: '分层连接', icon: '🔗',
    items: [
      { en: 'First, … Second, … Besides, …', zh: '第一…第二…此外…' },
      { en: 'What\'s more, …', zh: '更重要的是…' },
      { en: 'On the one hand, … On the other hand, …', zh: '一方面…另一方面…' },
      { en: 'However, …', zh: '然而…（转折）' },
    ],
  },
  {
    fn: '举例支撑', icon: '📌',
    items: [
      { en: 'For example, …', zh: '例如…' },
      { en: 'Take … as an example.', zh: '以…为例。' },
      { en: 'Last year, I …', zh: '去年我…（用事实支撑优势）' },
    ],
  },
  {
    fn: '提建议', icon: '💡',
    items: [
      { en: 'You\'d better …', zh: '你最好…（比 must 礼貌）' },
      { en: 'Why not …?', zh: '为什么不…呢？' },
      { en: 'It would be a good idea to …', zh: '…会是个好主意。' },
      { en: 'I suggest that you …', zh: '我建议你…' },
    ],
  },
  {
    fn: '结尾收束', icon: '🏁',
    items: [
      { en: 'In a word, …', zh: '总之…' },
      { en: 'I hope you will take an active part in it.', zh: '希望你能积极参加。' },
      { en: 'I\'m looking forward to seeing you.', zh: '期待见到你。' },
      { en: 'I would appreciate it if you could …', zh: '如果您能…我将不胜感激。' },
    ],
  },
];

/* 四、写作高频失分点 */
export const WRITING_TRAPS = [
  { t: '时态混用', d: '记叙用过去时，通知/介绍用现在或将来时。一篇里不能一会儿过去一会儿现在。', fix: '下笔前先定一个主时态，全文跟着它走。' },
  { t: '第三人称单数漏 -s', d: 'He go / She like / My father work 是最高频的拼写类失分。', fix: '写完专门扫一遍所有动词，主语是 he/she/it/单数名词的加 -s。' },
  { t: '可数名词忘复数', d: 'many student / two book / some friend', fix: '看到 many / some / two 后面的名词，先确认加没加 -s。' },
  { t: '字数不足', d: '低于 60 词会明显扣分，常见于「要点写得太简单」。', fix: '每个要点至少写两句：一句陈述 + 一句展开（原因/例子）。' },
  { t: '要点漏写', d: '题目给 3 条要点只写了 2 条，内容分直接掉一档。', fix: '写完逐条对照题目打勾，缺的补一句。' },
  { t: '全文无连接词', d: '句子之间没有 First / Second / Besides，读起来像散句堆叠。', fix: '每个理由前加一个连接词，成本最低、得分最明显。' },
];
