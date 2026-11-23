/* ==========================================================
   北京中考英语 · 书面表达
   分值：1 题 10 分（笔试第五部分，通常要求 80–100 词）

   【数据规范】
     id / level / type / title
     prompt    题目要求（含 3 个内容要点）
     given     已给出的开头结尾（不计入词数）
     outline   写作提纲（每段写什么）
     keyPoints 必备句式（en + zh，可直接套用）
     model     范文（词数与要求一致）
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
    id: 'w1', level: '基础', type: '应用文·通知', title: '写一则英语角通知',
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
    tips: [
      '通知必须有称呼和 "May I have your attention, please?" 这类提示语——这是应用文的格式分，缺了就丢。',
      '时间地点要写全：next Friday afternoon + school hall + 3:00 to 5:00。只写「下周五」不写具体时段，内容分会被扣。',
      '题目给了 3 个要点，就必须出现 3 个对应句子，一一对应。阅卷时是「按点给分」。',
      '结尾用 "I hope…" 或 "We are looking forward to…" 收束，比干巴巴的 "Please come." 更得体。',
      '全文用一般将来时（is going to / will），不要混用过去时。',
    ],
  },
  {
    id: 'w2', level: '重点', type: '应用文·书信', title: '给外国笔友回信介绍北京',
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
    tips: [
      '书信要有「回应来信」的句子（I\'m glad to hear that…）——这是书信体的交际功能分，不是可有可无的客套。',
      '推荐理由要具体：history / view / photos 三点，比只说 "It is beautiful." 更容易拿高分。',
      '提醒事项用 You\'d better… 比 You must… 更礼貌，符合给朋友建议的语气。',
      '注意时态：介绍长城用一般现在时，谈将来的行程用一般将来时。',
      '结尾 "I can\'t wait to see you." 是地道表达，比 "I want to see you soon." 更自然。',
    ],
  },
  {
    id: 'w3', level: '重点', type: '议论文·观点', title: '谈谈中学生该不该做家务',
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
    tips: [
      '议论文结构要清晰：亮观点 → 两条理由 → 自身例子 → 总结。阅卷老师一眼能看到层次，就是「结构分」。',
      '理由用 First… Second… 明确标号，比混在一段里更容易得分。',
      '「自身例子」这一段是题目明确要求的要点，不能省略——很多人只写观点和理由就交了。',
      '结尾用 In a word 收束并升华（not a waste of time / a way to grow up），是议论文的高分写法。',
      '注意：题目说「不得出现真实姓名和校名」，范文用 As for me 回避了这个问题。',
    ],
  },
  {
    id: 'w4', level: '难点', type: '应用文·申请信', title: '写一封志愿者申请信',
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
    tips: [
      '申请信的三个要素必须齐全：申请原因、个人优势、希望承担的岗位。缺一项就丢内容分。',
      '「优势」不能只说 I am good at English，要用事实支撑（获奖、去年做过什么）——这是 9 分与 7 分的差别。',
      '希望承担的工作要具体（接待外宾 / 翻译），比笼统的 "I can do anything" 更能体现诚意。',
      '注意礼貌用语：I would appreciate it if you could… 是申请信的高分句式。',
      '全文以一般现在时为主，谈「如果被选中」时用 would like to，注意语气分寸。',
    ],
  },
];
