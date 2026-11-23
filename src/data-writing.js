/* ==========================================================
   北京中考英语 · 书面表达与听说机考
   书面表达：北京卷第四部分，10 分，通常要求 80–100 词
   听说机考：40 分，四节 —— 听后选择 / 听后回答 / 听后记录并转述 / 朗读短文
   ========================================================== */

/* ---------------- 书面表达 ---------------- */
export const WRITING = [
  {
    id: 'w1', level: '基础', type: '应用文·通知', title: '写一则英语角通知',
    prompt: '假定你是学生会主席李华。学校将于下周五下午举办英语角活动，请你用英语写一则通知。内容包括：\n1. 活动时间与地点；\n2. 活动内容（如英语歌曲、短剧表演、自由交流）；\n3. 邀请同学们参加。\n\n注意：1. 词数 80–100；2. 开头和结尾已给出，不计入总词数。',
    given: 'Boys and girls,\n\nMay I have your attention, please?\n\n______________________________________________________________________\n\n______________________________________________________________________\n\nThank you.\n\nThe Students\' Union',
    outline: [
      '第一段：说明活动时间、地点（下周五下午 3 点，学校礼堂）',
      '第二段：介绍活动内容（唱英语歌、演短剧、与外教自由交流）',
      '第三段：号召参加，说明意义（提高口语、交朋友）',
    ],
    keyPoints: [
      { en: 'be going to / will be held', zh: '将举办' },
      { en: 'in the school hall', zh: '在学校礼堂' },
      { en: 'sing English songs and put on short plays', zh: '唱英语歌、演短剧' },
      { en: 'communicate with foreign teachers', zh: '与外教交流' },
      { en: 'improve your spoken English', zh: '提高英语口语' },
      { en: 'make new friends', zh: '结交新朋友' },
      { en: 'take an active part in', zh: '积极参加' },
    ],
    model: `Boys and girls,

May I have your attention, please?

Our school is going to hold an English Corner next Friday afternoon. It will take place in the school hall from 3:00 to 5:00.

At the English Corner, you can sing English songs, put on short plays and talk with our foreign teachers. There will also be some interesting games. Everyone can practise speaking English in a relaxed way.

I hope all of you will take an active part in it. It is a good chance to improve your spoken English and make new friends. We are looking forward to seeing you there.

Thank you.

The Students' Union`,
    tips: [
      '通知开头要有称呼与 "May I have your attention, please?" 这样的提示语，这是应用文的固定格式分。',
      '时间地点务必齐全：next Friday afternoon + school hall + 3:00–5:00，缺一项就丢内容分。',
      '结尾用 "I hope…" 或 "We are looking forward to…" 收束，比干巴巴的 "Please come." 更得体。',
    ],
  },
  {
    id: 'w2', level: '重点', type: '应用文·书信', title: '给外国笔友回信介绍北京',
    prompt: '你的英国笔友 Peter 打算寒假来北京旅游，来信询问北京的情况。请你给他回一封信，内容包括：\n1. 推荐一个你认为最值得去的地方，并说明理由；\n2. 提醒他来北京需要注意的一件事（如天气、交通、饮食）；\n3. 表示欢迎并期待见面。\n\n注意：1. 词数 80–100；2. 开头和结尾已给出，不计入总词数。',
    given: 'Dear Peter,\n\nI\'m very glad to hear that you are coming to Beijing this winter.\n\n______________________________________________________________________\n\n______________________________________________________________________\n\nBest wishes,\n\nLi Hua',
    outline: [
      '第一段：表示欢迎，点明推荐地点（如故宫 / 长城）',
      '第二段：说明推荐理由（历史、景色、拍照）',
      '第三段：提醒注意事项（冬天很冷，要多带衣服）',
      '第四段：期待见面',
    ],
    keyPoints: [
      { en: 'I\'m glad to hear that…', zh: '很高兴听说…' },
      { en: 'the best place to visit', zh: '最值得去的地方' },
      { en: 'the Palace Museum / the Great Wall', zh: '故宫 / 长城' },
      { en: 'It has a long history.', zh: '它有悠久的历史' },
      { en: 'You\'d better bring some warm clothes.', zh: '你最好带些厚衣服' },
      { en: 'It is very cold in winter here.', zh: '这里冬天很冷' },
      { en: 'I\'m looking forward to seeing you.', zh: '期待见到你' },
    ],
    model: `Dear Peter,

I'm very glad to hear that you are coming to Beijing this winter.

If you ask me which place is worth visiting most, I would say the Great Wall. It is one of the most famous places in the world, and it has a history of more than two thousand years. Standing on the wall, you can enjoy a wonderful view. I'm sure you will love it.

By the way, it is very cold in Beijing in winter, sometimes below zero. So you'd better bring some warm clothes and a pair of comfortable shoes.

I can't wait to see you. I will show you around the city.

Best wishes,

Li Hua`,
    tips: [
      '书信要有「回应来信」的句子（I\'m glad to hear that…），这是书信体的交际功能分。',
      '推荐理由要具体：history / view / photos 三点比只说 "It is beautiful." 更容易拿高分。',
      '提醒事项用 You\'d better… 比 You must… 更礼貌，符合给朋友建议的语气。',
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
      { en: 'In my opinion, …', zh: '在我看来' },
      { en: 'learn to be independent', zh: '学会独立' },
      { en: 'understand how hard our parents work', zh: '理解父母多辛苦' },
      { en: 'help with the housework', zh: '帮忙做家务' },
      { en: 'do the dishes / sweep the floor / take out the rubbish', zh: '洗碗 / 扫地 / 倒垃圾' },
      { en: 'feel proud of myself', zh: '为自己感到自豪' },
      { en: 'It is our duty to…', zh: '…是我们的责任' },
    ],
    model: `Should middle school students do housework? In my opinion, the answer is yes.

First, doing housework helps us learn to be independent. Many students depend on their parents for everything. If we learn to cook and clean, we can take care of ourselves in the future. Second, doing housework helps us understand how hard our parents work. When we sweep the floor or wash the dishes, we begin to realize that keeping a home tidy is not easy.

As for me, I often help my mother do the dishes and take out the rubbish at weekends. Although it only takes a few minutes, I feel proud of myself.

In a word, doing housework is not a waste of time. It is our duty and also a good way to grow up.`,
    tips: [
      '议论文结构要清晰：亮观点 → 两条理由 → 自身例子 → 总结，阅卷老师一眼能看到层次。',
      '理由用 First… Second… 明确标号，比混在一段里更容易得「结构分」。',
      '结尾用 In a word 收束并升华（not a waste of time），是议论文的高分写法。',
    ],
  },
];

/* ---------------- 听说机考 ---------------- */
export const SPEAKING = {
  intro: '北京中考英语听说机考满分 40 分，与笔试分开进行，通常有两次机会取高分。共四节，全部在计算机上完成。',
  sections: [
    {
      id: 'listen-choose', name: '听后选择', score: 12, count: '6 小题 × 2 分',
      desc: '听一段对话或短文，从每题三个选项中选出最佳答案。考查抓取关键信息（时间、地点、人物、原因）。',
      skills: ['听前快速浏览题干与选项，预判要听什么', '抓关键词：数字、时间、地点、转折词 but / however', '注意同义替换，正确选项往往不是原词照抄'],
      sample: {
        audio: '（机考原音）W: Hi, Tom. Are you going to the library this afternoon?\nM: I planned to, but I have to finish my science report first. Maybe tomorrow.',
        question: 'What will Tom do this afternoon?',
        options: ['Go to the library.', 'Finish his science report.', 'Visit his teacher.'],
        answer: 1,
        why: '男士说 "I planned to, but I have to finish my science report first"，but 后面才是实际安排，所以选 B。',
      },
    },
    {
      id: 'listen-answer', name: '听后回答', score: 8, count: '4 小题 × 2 分',
      desc: '听一段对话后，用英语口头回答屏幕上的问题。答案通常可直接从对话中提取，但要用完整句子。',
      skills: ['用完整句子作答，不要只蹦单词', '注意时态与人称要和问题一致', '语速平稳，发音清晰，避免长时间停顿'],
      sample: {
        audio: '（机考原音）M: Excuse me, how much is this T-shirt?\nW: It\'s 80 yuan. But if you buy two, you can get a 20% discount.',
        question: 'How much is one T-shirt?',
        answer: 'It is eighty yuan.',
        why: '对话中女士明确说 "It\'s 80 yuan"，用完整句子回答 It is eighty yuan. 即可得分。只答 "80" 会因不完整失分。',
      },
    },
    {
      id: 'listen-retell', name: '听后记录并转述', score: 12, count: '填表 6 空 + 转述 6 分',
      desc: '听一段短文两遍，第一遍填表格中的关键信息，第二遍检查；然后用 60 秒准备、90 秒口头转述短文内容。',
      skills: ['第一遍先填最有把握的空，不要卡在一个空上', '表格通常按时间顺序或要点顺序排列，可据此定位', '转述要用自己的话串起来，加上 First / Then / Finally 等连接词', '转述开头用 The passage is mainly about… 快速切入'],
      sample: {
        audio: '（机考原音短文）Last Saturday, Class Three went to the Science Museum. In the morning, they visited the space exhibition and learned about rockets. At noon, they had lunch in the museum restaurant. In the afternoon, they watched a 3D film about the ocean. Everyone had a great time.',
        table: {
          head: ['Time', 'Activity'],
          rows: [
            ['Last Saturday', 'went to the (1) ______ Museum'],
            ['In the morning', 'visited the (2) ______ exhibition'],
            ['At noon', 'had lunch in the museum (3) ______'],
            ['In the afternoon', 'watched a (4) ______ film about the ocean'],
          ],
        },
        answers: ['Science', 'space', 'restaurant', '3D'],
        retell: 'The passage is mainly about Class Three\'s trip to the Science Museum last Saturday. In the morning, they visited the space exhibition and learned about rockets. At noon, they had lunch in the museum restaurant. In the afternoon, they watched a 3D film about the ocean. Everyone had a great time.',
        why: '转述要覆盖时间、地点、活动三要素，并用连接词串成连贯语篇，而不是逐句背诵原文。',
      },
    },
    {
      id: 'read-aloud', name: '朗读短文', score: 8, count: '1 篇短文',
      desc: '屏幕给出一篇约 100 词的短文，准备 60 秒后朗读。评分关注发音准确度、语调自然度与流利度。',
      skills: ['注意连读与失去爆破，如 an apple / good boy', '句末降调，一般疑问句用升调', '不要逐词顿读，按意群停顿', '遇到生词按拼读规则大胆读，卡顿比读错扣分更多'],
      sample: {
        text: 'Reading is a wonderful habit. It opens a window to the world and helps us understand people from different cultures. Every day, try to spend at least twenty minutes reading. You can read a story, a poem, or even a piece of news. The more you read, the more you will know.',
        focus: ['wonderful /ˈwʌndəfl/ 注意不要读成 wonder-ful 三段', 'different /ˈdɪfrənt/ 中间是 /fr/ 连读', 'The more you read, the more you will know. 两个分句都用降调'],
      },
    },
  ],
  tips: [
    '机考有两次机会，第一次考完不要松懈，针对薄弱节次再练一个月，取两次中的高分。',
    '耳麦试音时务必确认能听清自己的声音，音量调到位，否则会影响整场发挥。',
    '听后回答与转述都要「说完整句子」，这是机考评分的硬性要求，只蹦单词会明显扣分。',
    '朗读时语速宁慢勿快，清晰度比速度重要；读错一个词不要回头重读，继续往下读。',
  ],
};
