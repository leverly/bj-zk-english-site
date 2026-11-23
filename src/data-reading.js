/* ==========================================================
   北京中考英语 · 阅读理解 + 阅读表达
   分值：阅读理解 13 小题 × 2 分 = 26 分 ｜ 阅读表达 4 小题 × 1 分 = 4 分

   【数据规范 · 解析准确性要求】
   每道选择题必须给全四项，缺一不可：
     q       题干
     options 四个选项
     answer  正确项索引
     locate  原文定位句（必须能在 passage 里逐字找到，用于回原文核对）
     why     为什么正确——必须引用定位句的关键信息，不能只说「符合文意」
     trap    干扰项分析：说明每个错项错在哪（无中生有/偷换概念/张冠李戴/过度推断）

   【学习方法】
   A 篇 应用文：先看题干再扫读定位，训练「找信息」速度
   B 篇 记叙文：抓时间线与情感变化，注意转折词
   C 篇 说明文：抓段落主旨句与数据细节
   D 篇 议论文：区分作者观点与他人观点，警惕绝对化表述
   阅读表达：必须用英文作答，答案要能直接对应原文信息点
   ========================================================== */

export const PASSAGES = [
  /* ==================== 套 1 ==================== */
  {
    id: 's1-a', set: 1, level: 'A', type: '应用文',
    title: 'City Library Summer Programme',
    intro: '信息查找题：先读题干，再回原文定位，不必逐句翻译。',
    passage: `CITY LIBRARY SUMMER PROGRAMME 2025

【Reading Challenge】
Read 6 books between July 1 and August 31.
Write a short review (about 50 words) for each book.
Prize: a 50-yuan book voucher and a certificate.
Sign up at the front desk before June 30.

【Story Time for Kids】
Every Saturday, 10:00 a.m. – 11:00 a.m.
For children aged 4 to 8.
Parents must stay with their children.
Place: Children's Room, 2nd floor.
Free, no need to book.

【Computer Help】
Do you need help with using a computer or the internet?
Every Wednesday, 2:00 p.m. – 4:00 p.m.
Bring your own laptop if you have one.
For people over 60. Free.
Place: Computer Room, 3rd floor.

【Book Sale】
Old books at very low prices.
August 20 – August 25, 9:00 a.m. – 5:00 p.m.
Most books are 3 to 8 yuan.
Place: the hall on the 1st floor.
All money will go to a children's hospital.`,
    questions: [
      {
        q: 'To take part in the Reading Challenge, a reader must ___.',
        options: [
          'read six books and write reviews',
          'pay 50 yuan for a voucher',
          'sign up before August 31',
          'read books only in the library',
        ],
        answer: 0,
        locate: 'Read 6 books between July 1 and August 31. Write a short review (about 50 words) for each book.',
        why: '定位句明确要求「读 6 本书」并且「每本写一篇短评」，两个条件缺一不可，A 完整概括了这两个要求。',
        trap: 'B 把「奖品是 50 元代金券」说成「要付 50 元」，方向反了；C 把「6 月 30 日前报名」错成「8 月 31 日」（那是活动结束日）；D 原文从未要求必须在馆内阅读。',
      },
      {
        q: 'Who can get help in the Computer Room?',
        options: [
          'A 10-year-old student.',
          'A 45-year-old teacher.',
          'A 65-year-old person.',
          'A mother with a baby.',
        ],
        answer: 2,
        locate: 'For people over 60. Free.',
        why: 'Computer Help 部分明确写了服务对象是「60 岁以上的人」，只有 65 岁符合。',
        trap: 'A 的 10 岁对应的是 Story Time（4–8 岁也不符）；B 的 45 岁不在「60 岁以上」范围；D 是陪孩子参加 Story Time 的家长，与 Computer Help 无关。',
      },
      {
        q: 'What can we learn about the Book Sale?',
        options: [
          'It lasts for a month.',
          'It is held on the 2nd floor.',
          'The books are sold for charity.',
          'Every book costs 8 yuan.',
        ],
        answer: 2,
        locate: 'All money will go to a children\'s hospital.',
        why: '「所有收入将捐给儿童医院」说明这是一次公益性质的义卖，C 正确。',
        trap: 'A 实际是 8 月 20–25 日共 6 天，不是一个月；B 原文是 1 楼大厅（the hall on the 1st floor），2 楼是儿童阅览室；D 原文是「大多数书 3 到 8 元」的价格区间，不是每本都是 8 元。',
      },
      {
        q: 'What do parents need to do at Story Time?',
        options: [
          'Book a place in advance.',
          'Stay with their children.',
          'Pay a small fee.',
          'Take their children to the 3rd floor.',
        ],
        answer: 1,
        locate: 'Parents must stay with their children.',
        why: '定位句直接写明家长必须陪同孩子，B 是原文同义表达。',
        trap: 'A 原文明确说 Free, no need to book（免费、无需预约），与 A 相反；C 原文标 Free；D 故事会在 2 楼，3 楼是电脑室。',
      },
    ],
    express: [],
  },
  {
    id: 's1-b', set: 1, level: 'B', type: '记叙文',
    title: 'The Week I Learned to Cook',
    intro: '记叙文：注意时间顺序与「我」的态度变化，这类题常考情感转折。',
    passage: `Last summer, my mother had to go to the hospital for two weeks. My father works in another city, so I had to look after myself. I was thirteen, and I had never cooked a meal before.

The first evening, I tried to make noodles. I put the noodles into cold water and waited. Twenty minutes later, they turned into a sticky mess. I sat on the kitchen floor and wanted to cry.

Then I called my grandmother. She laughed — not in a bad way — and said, "Come here tomorrow. I'll teach you."

The next morning I went to her flat. She showed me how to boil water first, then put in the noodles, and how to tell when they were ready. "The secret," she said, "is to taste them. Never trust the clock alone."

For the next ten days, I cooked dinner every evening. I made tomato and egg, fried rice, and finally a simple soup. Some dishes were still not good, but each time I learned something.

When my mother came home, I made her a bowl of noodles. She ate it slowly and said nothing for a while. Then she looked up and said, "This is the best noodles I've ever had."

I knew it probably wasn't true. But I also knew that in those two weeks, I had learned more than cooking.`,
    questions: [
      {
        q: 'Why did the writer have to cook for himself last summer?',
        options: [
          'He wanted to learn a new skill.',
          'His mother was in hospital and his father was away.',
          'His grandmother was too old to help him.',
          'He did not like the food at school.',
        ],
        answer: 1,
        locate: 'Last summer, my mother had to go to the hospital for two weeks. My father works in another city, so I had to look after myself.',
        why: '定位句给出两个原因：母亲住院两周、父亲在外地工作，所以只能自己照顾自己。B 完整覆盖这两个原因。',
        trap: 'A 是结果而非原因（他是被迫学的）；C 原文中祖母不但健在还教他做饭；D 全文未提及学校伙食，属无中生有。',
      },
      {
        q: 'How did the writer feel after his first try at cooking?',
        options: [
          'Proud and excited.',
          'Angry with his mother.',
          'Upset and helpless.',
          'Bored but calm.',
        ],
        answer: 2,
        locate: 'I sat on the kitchen floor and wanted to cry.',
        why: '「坐在厨房地板上想哭」直接表现沮丧无助，C 准确概括。',
        trap: 'A 与「想哭」相反；B 全文没有对母亲的埋怨；D「平静」与想哭的状态矛盾。',
      },
      {
        q: 'What did the grandmother think was the most important when cooking noodles?',
        options: [
          'Boiling the water first.',
          'Using fresh noodles.',
          'Tasting them while cooking.',
          'Following the clock exactly.',
        ],
        answer: 2,
        locate: '"The secret," she said, "is to taste them. Never trust the clock alone."',
        why: '祖母用 the secret 明确点出秘诀是「尝一尝」，并说「不要只信时钟」，C 正确。',
        trap: 'A 是先烧水，属于步骤但不是她强调的「秘诀」；B 原文未提面条是否新鲜；D 与「Never trust the clock alone」正好相反。',
      },
      {
        q: 'What does the writer mean by "I had learned more than cooking"?',
        options: [
          'He had learned to be independent.',
          'He had learned many new recipes.',
          'He had learned to respect his mother.',
          'He had learned how to run a kitchen.',
        ],
        answer: 0,
        locate: 'I knew it probably wasn\'t true. But I also knew that in those two weeks, I had learned more than cooking.',
        why: '全文讲他独自生活两周、从不会做饭到能照顾母亲，结尾这句话是对整段经历的总结：除了做饭，更学会了独立。A 是对主旨的准确概括。',
        trap: 'B 只是技能层面，与「more than cooking」（不止于做饭）矛盾；C 原文没有「从不尊重到尊重」的转变；D 是做饭的延伸，仍属 cooking 范畴，没体现「more than」。',
      },
    ],
    express: [],
  },
  {
    id: 's1-c', set: 1, level: 'C', type: '说明文',
    title: 'Why Do We Yawn?',
    intro: '说明文：抓段落主旨与数据，注意「研究发现」类表述。',
    passage: `We all yawn. But why do we do it? For a long time, people believed that yawning helped us take in more oxygen. This idea sounded reasonable, but a famous experiment in 1987 showed that it was wrong. When scientists asked people to breathe air with more oxygen, they did not yawn less. When the air had less oxygen, they did not yawn more.

So what is the real reason? In recent years, scientists have found a new answer: yawning may cool down our brain.

The brain works best when it is at a certain temperature. When we are tired, or when we stay in a warm room for too long, the brain gets a little warmer. Yawning brings cooler air into the mouth and makes the blood in our head cooler. This helps the brain go back to its best working temperature.

This idea explains several things. First, we yawn more when we are tired — because a tired brain is a warmer brain. Second, we yawn more in summer than in winter. Third, people who put a cold towel on their head yawn less.

Some scientists are still not sure. They say that yawning might have more than one purpose, and cooling may be only one of them. But most of them agree that the old oxygen idea is no longer believable.

So next time you yawn in class, you can tell your teacher that you are not being lazy — you are simply cooling your brain.`,
    questions: [
      {
        q: 'What did the 1987 experiment show?',
        options: [
          'Yawning helps people take in oxygen.',
          'The oxygen idea about yawning was wrong.',
          'People yawn more when air has more oxygen.',
          'Scientists could not do the experiment well.',
        ],
        answer: 1,
        locate: 'This idea sounded reasonable, but a famous experiment in 1987 showed that it was wrong.',
        why: '定位句中的 it 指代前一句的「打哈欠帮助吸入更多氧气」这一想法，实验证明它错了，B 正确。',
        trap: 'A 正是被实验否定的旧观点；C 原文说「氧气多时并没有打哈欠变少」，与 C 相反；D 原文没有质疑实验本身的质量。',
      },
      {
        q: 'According to the new idea, what makes us yawn?',
        options: [
          'A lack of oxygen in the blood.',
          'A need to cool down the brain.',
          'Too much water in the body.',
          'A sudden change of weather.',
        ],
        answer: 1,
        locate: 'scientists have found a new answer: yawning may cool down our brain.',
        why: '原文用「科学家找到了新答案」引出核心观点：打哈欠可能是为了给大脑降温，B 是原文直接表述。',
        trap: 'A 是被否定的旧观点；C、D 原文均未提及，属无中生有。',
      },
      {
        q: 'Which fact supports the cooling idea?',
        options: [
          'We yawn more in summer than in winter.',
          'We yawn when we are nervous.',
          'Babies yawn more than adults.',
          'We yawn less after a good sleep.',
        ],
        answer: 0,
        locate: 'First, we yawn more when we are tired — because a tired brain is a warmer brain. Second, we yawn more in summer than in winter.',
        why: '原文列举「支持该想法的三件事」，其中第二条就是「夏天比冬天打哈欠更多」，因为夏天更热、更需要降温。',
        trap: 'B、C 原文未提及；D 虽符合常识，但原文举的第三条是「头上放冷毛巾会少打哈欠」，并未提「睡好后少打哈欠」，属于把常识当成原文信息。',
      },
      {
        q: 'What is the best title for the passage?',
        options: [
          'How to Stop Yawning in Class',
          'A New Answer to an Old Question',
          'The Temperature of the Human Brain',
          'Why Scientists Disagree with Each Other',
        ],
        answer: 1,
        locate: 'We all yawn. But why do we do it? ... So what is the real reason? In recent years, scientists have found a new answer',
        why: '全文结构是「提出老问题（为什么打哈欠）→ 否定旧答案 → 给出新答案（降温）」，B 准确概括这个主线。',
        trap: 'A 只是结尾一句的玩笑话，不是主旨；C 只是解释新答案时用到的概念，范围过窄；D 只是最后一段的局部内容。',
      },
    ],
    express: [],
  },
  {
    id: 's1-d', set: 1, level: 'D', type: '议论文',
    title: 'Should Schools Start Later?',
    intro: '议论文：区分「支持者观点」「反对者观点」与「作者观点」，这三者常被混考。',
    passage: `In many cities, middle schools start at 7:30 in the morning. Some doctors now say this is too early, and they want schools to start at 8:30 or later.

Their main reason is sleep. Studies show that teenagers need about nine hours of sleep a night, but many get only seven. One reason is that teenagers naturally go to bed later — their bodies change at this age. If school starts at 7:30, a student who goes to bed at 11:00 must get up at 6:30, which gives only seven and a half hours.

Supporters of a later start also point to grades. In one American city, schools moved their start time from 7:30 to 8:45. After two years, students' marks went up, and more students came to school on time.

But not everyone agrees. Some parents say that a later start makes the morning harder, because they must leave for work at 8:00. If school starts at 8:45, they cannot take their children to school. Others worry about after-school activities. If school ends later, students have less time for sports, and some may get home after dark in winter.

There is also a money question. In many places, school buses must make two or three trips each morning. If all schools start at the same later time, more buses and drivers are needed, which costs a lot.

In my opinion, the idea is good but cannot be done in one step. A better way may be to start only the first class later, or to let older students start later than younger ones. What we should not do is simply keep the early time and say the problem is that students are lazy.`,
    questions: [
      {
        q: 'What is the main reason doctors give for a later start?',
        options: [
          'Students do not eat breakfast.',
          'Teenagers do not get enough sleep.',
          'School buses are too crowded.',
          'Teachers arrive at school too early.',
        ],
        answer: 1,
        locate: 'Their main reason is sleep. Studies show that teenagers need about nine hours of sleep a night, but many get only seven.',
        why: '原文用 Their main reason is sleep 直接点明主要理由是睡眠，并给出「需要 9 小时、实际只有 7 小时」的数据。',
        trap: 'A、D 原文未提及；C 是最后一段提到的「经费问题」的一部分，不是医生的主要理由。',
      },
      {
        q: 'What happened in the American city after the start time changed?',
        options: [
          'Students\' marks went up.',
          'Parents went to work later.',
          'Teachers worked fewer hours.',
          'The city built more schools.',
        ],
        answer: 0,
        locate: 'In one American city, schools moved their start time from 7:30 to 8:45. After two years, students\' marks went up, and more students came to school on time.',
        why: '定位句明确写出「两年后学生成绩上升」，A 是原文 marks went up 的直接对应。',
        trap: 'B 原文说家长 8 点要上班，并未因换时间而推迟上班；C、D 原文完全没有提到，属无中生有。',
      },
      {
        q: 'Why do some parents disagree with the later start?',
        options: [
          'They think students should sleep less.',
          'They must leave for work before the new start time.',
          'They want their children to do more sports.',
          'They think school buses are too expensive.',
        ],
        answer: 1,
        locate: 'Some parents say that a later start makes the morning harder, because they must leave for work at 8:00. If school starts at 8:45, they cannot take their children to school.',
        why: '定位句给出家长反对的具体理由：他们 8 点要上班，学校 8:45 才开始就送不了孩子。B 准确复述。',
        trap: 'A 与原文相反（家长并非主张少睡，而是担心实际安排）；C 原文中「课后活动时间变少」是家长的担忧，不是「想让孩子多做运动」；D 关于校车费用的是另一段提出的问题，不是家长的理由。',
      },
      {
        q: 'What is the writer\'s own opinion?',
        options: [
          'The early start should be kept as it is.',
          'The change should be made step by step.',
          'All schools should start at 8:45 at once.',
          'Students are lazy and need to sleep less.',
        ],
        answer: 1,
        locate: 'In my opinion, the idea is good but cannot be done in one step. A better way may be to start only the first class later, or to let older students start later than younger ones.',
        why: '作者用 In my opinion 明确表态：方向对，但不能一步到位，并给出渐进方案（只推迟第一节课、高年级先推）。B 准确概括「step by step」。',
        trap: 'A 与作者态度相反（作者最后批评「保持早时间还说学生懒」）；C 是作者明确反对的「一步到位」；D 正是作者在结尾批评的观点。',
      },
      {
        q: 'The underlined word "lazy" in the last paragraph shows that the writer ___.',
        options: [
          'agrees that students are lazy',
          'thinks blaming students is wrong',
          'wants students to sleep more at noon',
          'is angry with the doctors',
        ],
        answer: 1,
        locate: 'What we should not do is simply keep the early time and say the problem is that students are lazy.',
        why: '作者用「我们不该做的，就是保持早时间然后说学生懒」这种否定句式，表明他反对把问题归咎于学生，B 正确。',
        trap: 'A 与否定句式相反；C 原文未提午睡；D 作者对医生只是认为方案需分步，并未表达愤怒。',
      },
    ],
    /* 阅读表达：北京卷第三部分，4 小题 × 1 分。
       要求用英文作答；判分采用「关键词组命中」而非全文比对，
       避免因语序/冠词差异误判——这对自动判分的准确性很关键。 */
    express: [
      {
        q: 'What is the main reason doctors give for starting school later?',
        answer: 'Teenagers do not get enough sleep.',
        accept: [
          'teenagers do not get enough sleep',
          'students do not get enough sleep',
          'they do not get enough sleep',
          'lack of sleep',
          'teenagers need more sleep',
          'students need more sleep',
        ],
        why: '原文第二段开头 Their main reason is sleep 后给出数据：需要 9 小时、实际只有 7 小时。答案要点是「睡眠不足」。',
      },
      {
        q: 'How many hours of sleep do teenagers need a night according to the passage?',
        answer: 'About nine hours.',
        accept: ['nine hours', 'about nine hours', '9 hours', 'about 9 hours', 'nine'],
        why: '原文原句：teenagers need about nine hours of sleep a night。直接抄原文数字即可。',
      },
      {
        q: 'Why do some parents find the later start difficult?',
        answer: 'Because they must leave for work at 8:00 and cannot take their children to school.',
        accept: [
          'because they must leave for work at 8:00 and cannot take their children to school',
          'they must leave for work at 8',
          'they have to go to work at 8',
          'they cannot take their children to school',
          'they must go to work early',
          'because they leave for work at 8',
        ],
        why: '原文：they must leave for work at 8:00. If school starts at 8:45, they cannot take their children to school. 答案需含「上班时间早」或「无法送孩子」其一。',
      },
      {
        q: 'What does the writer suggest at the end of the passage?',
        answer: 'To make the change step by step, for example by starting only the first class later.',
        accept: [
          'to make the change step by step for example by starting only the first class later',
          'make the change step by step',
          'start only the first class later',
          'do it step by step',
          'let older students start later',
          'change it gradually',
          'start the first class later',
        ],
        why: '原文末段：cannot be done in one step... A better way may be to start only the first class later, or to let older students start later。答案需体现「分步」或「只推迟第一节课」。',
      },
    ],
  },
];

/* ==================== 套 2（难度略升，覆盖更多设问角度） ==================== */
PASSAGES.push(
  {
    id: 's2-a', set: 2, level: 'A', type: '应用文',
    title: 'Volunteers Wanted for the City Marathon',
    intro: 'A 篇信息查找：注意表格中的时间、条件与联系方式，警惕「时间张冠李戴」。',
    passage: `VOLUNTEERS WANTED — CITY MARATHON

The City Marathon will be held on Sunday, October 12. We need about 200 volunteers. Please read the information below carefully.

【What you will do】
• Hand out water and fruit to runners (Water Stations)
• Show runners the way (Guide Posts)
• Help at the finish line (Finish Area)
• Take photos for the event (Media Team)

【Time】
All volunteers must arrive at 6:30 a.m. The race starts at 8:00 a.m. and ends at about 1:00 p.m. You must stay until the area is clean.

【What you need】
• Be at least 15 years old
• Be able to work for a whole morning
• Wear comfortable shoes and the volunteer T-shirt we give you

【Training】
A short training meeting will be held on Thursday, October 9, from 5:00 p.m. to 6:00 p.m. in Room 302. You must come — no training, no volunteering.

【How to join】
Fill in the form at www.citymarathon.org/volunteer before September 30.
If you have questions, call Ms Chen at 8765-4321 (weekdays 9:00 a.m. – 5:00 p.m.).

Volunteers will get a certificate and a free lunch.`,
    questions: [
      {
        q: 'How long must a volunteer stay on the day of the marathon?',
        options: ['About two hours.', 'From 6:30 a.m. to about 1:00 p.m.', 'Only until the race starts.', 'From 8:00 a.m. to 5:00 p.m.'],
        answer: 1,
        locate: 'All volunteers must arrive at 6:30 a.m. The race starts at 8:00 a.m. and ends at about 1:00 p.m. You must stay until the area is clean.',
        why: '定位句给出到达时间 6:30 a.m.、比赛结束时间 about 1:00 p.m.，且要留到场地清理完毕，因此服务时长是从 6:30 到下午 1 点左右。',
        trap: 'A 两小时是训练会议（5:00–6:00 p.m.）的时长，被张冠李戴；C 比赛 8 点才开始，志愿者 6:30 就得到；D 的 5:00 p.m. 是咨询电话的工作时间，不是服务时间。',
      },
      {
        q: 'What will happen if a volunteer does not go to the training meeting?',
        options: ['They will get no T-shirt.', 'They cannot be a volunteer.', 'They must pay for the lunch.', 'They will work at a water station.'],
        answer: 1,
        locate: 'You must come — no training, no volunteering.',
        why: '定位句用破折号强调「不参加培训就不能做志愿者」，B 是原文 no volunteering 的直接对应。',
        trap: 'A 原文说 T 恤由主办方提供，与培训无关；C 原文说午餐免费，未提罚款；D 水站是工作分配，与培训缺席无关。',
      },
      {
        q: 'Which of the following people can be a volunteer?',
        options: ['A 14-year-old student.', 'A 16-year-old student who is free on Sunday morning.', 'A person who can only work for one hour.', 'A person who cannot come on October 9.'],
        answer: 1,
        locate: 'You must come — no training, no volunteering.',
        why: '16 岁满足「至少 15 岁」，周日一上午有空满足「能工作整个上午」，B 同时符合两项条件。',
        trap: 'A 14 岁不满 15 岁；C 只能工作一小时，不符合「整个上午」；D 10 月 9 日不能来就违反了培训要求。',
      },
      {
        q: 'What is the purpose of this passage?',
        options: ['To report a sports event.', 'To look for helpers for an event.', 'To teach people how to run.', 'To sell tickets for a race.'],
        answer: 1,
        locate: 'We need about 200 volunteers. Please read the information below carefully.',
        why: '标题是 VOLUNTEERS WANTED（招募志愿者），首段说需要约 200 名志愿者，全文都在讲条件与报名方式，目的是招募工作人员。',
        trap: 'A 报道赛事应写结果与成绩，本文只讲招募；C 全文没有跑步技巧；D 全文未提售票。',
      },
    ],
    express: [],
  },
  {
    id: 's2-b', set: 2, level: 'B', type: '记叙文',
    title: 'The Garden on the Roof',
    intro: 'B 篇记叙文：注意「起初怀疑 → 后来改变」的态度变化，这类题常考作者观点转变。',
    passage: `When my father first told me he wanted to grow vegetables on our roof, I thought it was a terrible idea. Our building is old, and the roof is flat and empty. "Nobody does that," I said. "The neighbours will laugh at us."

My father just smiled. He is not a man who talks much. He went out and came back with eight big boxes, some soil, and a bag of seeds.

The first month was a disaster. The soil was too heavy and the boxes began to break. Birds ate most of the seeds. My mother said, "Maybe we should stop." But my father only moved the boxes to a corner where the wind was weaker, and planted again.

In July, the first small green leaves appeared. By August, we had tomatoes, peppers and cucumbers. The roof, which had always been grey and empty, turned green.

Then something unexpected happened. Our neighbour Mrs Wang, who is seventy, came up one evening and asked if she could have some tomatoes. My father gave her a whole bag. The next week, she brought us a jar of tomato sauce she had made herself.

After that, more neighbours came. Some brought seeds. Some helped water the plants. An old man from the third floor, who had lived in our building for twenty years, said he had never talked to his neighbours before.

Last month, my father put a small wooden chair on the roof. Now, in the evening, three or four people sit there and talk.

I still don't think the vegetables are cheaper than the ones in the market. But I have stopped thinking that my father's idea was terrible. The roof did not just give us vegetables. It gave the whole building a place to meet.`,
    questions: [
      {
        q: 'How did the writer feel about the roof garden at first?',
        options: ['Very excited.', 'Strongly against it.', 'A little curious.', 'Worried about the cost.'],
        answer: 1,
        locate: 'I thought it was a terrible idea. ... "Nobody does that," I said. "The neighbours will laugh at us."',
        why: '「我觉得这是个糟糕的主意」「没人这么做」「邻居会笑话我们」都表明作者起初强烈反对，B 准确概括。',
        trap: 'A 与 terrible idea 相反；C 作者不是好奇而是否定；D 作者反对的理由是「别人会笑话」，不是费用。',
      },
      {
        q: 'What problem did the garden have in the first month?',
        options: ['The roof was too small.', 'The soil was too heavy and birds ate the seeds.', 'The neighbours complained.', 'There was not enough sunlight.'],
        answer: 1,
        locate: 'The soil was too heavy and the boxes began to break. Birds ate most of the seeds.',
        why: '定位句明确列出两个问题：土太重把箱子压坏、鸟吃掉了大部分种子，B 完整覆盖。',
        trap: 'A 原文说屋顶是平的且空旷，不是太小；C 原文邻居后来主动来要番茄，没有抱怨；D 原文未提光照不足。',
      },
      {
        q: 'What did Mrs Wang do after getting the tomatoes?',
        options: ['She asked for more vegetables.', 'She gave the family some tomato sauce.', 'She helped water the plants.', 'She bought a wooden chair.'],
        answer: 1,
        locate: 'The next week, she brought us a jar of tomato sauce she had made herself.',
        why: '定位句说她第二周带来了一罐自己做的番茄酱，B 是原文直接对应。',
        trap: 'A 原文是「问能不能给些番茄」，之后是回赠而非再要；C 浇水的是「其他邻居」，原文未指明是 Mrs Wang；D 椅子是父亲放的。',
      },
      {
        q: 'What does the writer think now?',
        options: ['The garden is a waste of money.', 'The garden brought the neighbours together.', 'The vegetables are cheaper than those in the market.', 'His father should stop growing vegetables.'],
        answer: 1,
        locate: 'The roof did not just give us vegetables. It gave the whole building a place to meet.',
        why: '结尾句明确：屋顶不只是给了蔬菜，还给了整栋楼一个相聚的地方，B 准确概括作者现在的看法。',
        trap: 'A 作者已说「不再认为父亲的想法糟糕」；C 原文明确说「我仍不认为这些菜比市场便宜」，与 C 相反；D 与作者态度转变相反。',
      },
    ],
    express: [],
  },
  {
    id: 's2-c', set: 2, level: 'C', type: '说明文',
    title: 'The Secret of Honey',
    intro: 'C 篇说明文：注意数字与「因果链」，常考「为什么能…」。',
    passage: `Honey has been used by humans for at least 8,000 years. It is one of the few foods that never goes bad. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old — and the honey was still safe to eat.

Why does honey last so long? There are three main reasons.

First, honey has very little water in it. Bacteria and other tiny living things need water to grow. Honey is about 80 percent sugar and less than 20 percent water, so there is not enough water for them to live.

Second, honey is acidic. Its pH is usually between 3.2 and 4.5, which is too acidic for most bacteria.

Third, bees add an enzyme to honey. This enzyme slowly produces a small amount of hydrogen peroxide, which kills bacteria.

These three conditions work together. If you take honey out of its pot and add water to it, it will start to go bad in a few days — because you have taken away the first protection.

Honey does have one danger. It can contain a bacterium that is harmless to adults but dangerous to babies under one year old. This is why doctors tell parents not to give honey to very young children.

Today, honey is still used in many ways: as a sweet food, in cooking, and even in some medicines. But its most amazing quality is the one we cannot see — it simply waits, year after year, without changing.`,
    questions: [
      {
        q: 'What did archaeologists find in ancient Egyptian tombs?',
        options: ['Pots of honey that were still safe to eat.', 'The first beekeeping tools.', 'Ancient recipes for cooking honey.', 'Bones of bees.'],
        answer: 0,
        locate: 'Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old — and the honey was still safe to eat.',
        why: '定位句直接说明：在埃及古墓里发现 3000 多年前的蜂蜜，且仍可安全食用。',
        trap: 'B「最早的养蜂工具」、C「古代蜂蜜烹饪食谱」、D「蜜蜂骨骼」原文均未提及，属无中生有。',
      },
      {
        q: 'Why can bacteria NOT grow in honey?',
        options: ['Because honey is very cold.', 'Because honey has too little water and is acidic.', 'Because honey is made by bees.', 'Because honey is kept in pots.'],
        answer: 1,
        locate: 'First, honey has very little water in it. Bacteria and other tiny living things need water to grow.',
        why: '原文给出三个原因，其中前两个是「水分极少」和「呈酸性」，B 概括了这两条。',
        trap: 'A 原文未提温度；C「由蜜蜂制造」是事实但不是抑菌原因；D 容器与抑菌无关——原文反而说取出加水后会变质。',
      },
      {
        q: 'What will happen if you add water to honey?',
        options: ['It will become sweeter.', 'It will start to go bad in a few days.', 'It will produce more honey.', 'It will become a medicine.'],
        answer: 1,
        locate: 'If you take honey out of its pot and add water to it, it will start to go bad in a few days — because you have taken away the first protection.',
        why: '定位句直接说明加水后几天内就会变质，原因是失去了「水分少」这第一道保护。',
        trap: 'A 原文未提变甜；C 加水不会产生蜂蜜；D 原文只说蜂蜜可用于某些药物，与加水无关。',
      },
      {
        q: 'Why should babies under one year old NOT eat honey?',
        options: ['Honey is too sweet for them.', 'Honey may contain a bacterium that is dangerous to them.', 'Honey has too much water.', 'Honey is too expensive.'],
        answer: 1,
        locate: 'It can contain a bacterium that is harmless to adults but dangerous to babies under one year old.',
        why: '定位句明确：蜂蜜可能含有一种对成人无害、但对一岁以下婴儿危险的细菌。',
        trap: 'A 原文未以「太甜」为理由；C 原文说蜂蜜水分很少，且这是保鲜原因而非危险原因；D 原文未提价格。',
      },
    ],
    express: [],
  },
  {
    id: 's2-d', set: 2, level: 'D', type: '议论文',
    title: 'Are Smartphones Bad for Students?',
    intro: 'D 篇议论文：作者观点常藏在「让步」之后（Although… / Of course… 后面才是重点）。',
    passage: `Few topics make parents and teachers argue more than smartphones. Many schools now ask students to hand in their phones at the start of the day. Is this the right thing to do?

Those who support the rule point to clear facts. A study of 1,000 students found that those who used their phones for more than three hours a day got lower marks in reading tests. Teachers also say that phones break students' attention: a student who checks a message needs several minutes to return to the lesson.

There is also the question of sleep. Many students keep their phones beside their beds. A message at midnight can wake them up, and the blue light from the screen makes it harder to fall asleep again.

However, some teachers are not sure that taking phones away is the answer. They say that the real problem is not the phone itself but what students do with it. A student who plays games all evening would probably do something else if there were no phone. Taking the phone away may hide the problem instead of solving it.

Others point out that phones can be useful in class. Students can look up a word, record a science experiment, or use an app to practise pronunciation. If phones are simply locked away, these chances are lost.

In my view, the answer is not "yes" or "no". A complete ban is easy to make but hard to keep, and it teaches students nothing about self-control. A better way is to teach students how to use phones well, and to set clear rules — for example, no phones during lessons, but phones allowed for learning tasks. The goal should be to help students become the kind of people who can put the phone down by themselves.`,
    questions: [
      {
        q: 'What did the study of 1,000 students find?',
        options: ['Students who used phones more got lower reading marks.', 'Most students use phones for three hours a day.', 'Phones help students read faster.', 'Students without phones sleep better.'],
        answer: 0,
        locate: 'A study of 1,000 students found that those who used their phones for more than three hours a day got lower marks in reading tests.',
        why: '定位句明确：每天用手机超过三小时的学生阅读成绩更低。',
        trap: 'B 原文是「超过三小时的人」成绩更低，不是「大多数学生每天用三小时」；C 与原文相反；D 原文谈睡眠问题，但那是另一个论据，不是这项研究的发现。',
      },
      {
        q: 'Why do some teachers doubt that taking phones away solves the problem?',
        options: ['Because phones are too expensive to take away.', 'Because the real problem is how students use their time.', 'Because students need phones to call their parents.', 'Because the study was not true.'],
        answer: 1,
        locate: 'They say that the real problem is not the phone itself but what students do with it. ... Taking the phone away may hide the problem instead of solving it.',
        why: '定位句指出真正的问题不是手机本身，而是学生拿它做什么；收走手机只是「掩盖」问题。B 准确复述。',
        trap: 'A 原文未提价格；C 原文未提与家长联系；D 原文没有质疑研究的真实性。',
      },
      {
        q: 'What is one advantage of phones in class mentioned in the passage?',
        options: ['Students can play games to relax.', 'Students can look up words and record experiments.', 'Students can send messages to friends.', 'Students can take better notes than by hand.'],
        answer: 1,
        locate: 'Students can look up a word, record a science experiment, or use an app to practise pronunciation.',
        why: '定位句列举了课堂上使用手机的三项好处：查单词、录制实验、用 app 练发音，B 覆盖前两项。',
        trap: 'A 玩游戏是原文提到的问题，不是好处；C 发消息是原文说的「打断注意力」的行为；D 原文未比较手写笔记与手机笔记。',
      },
      {
        q: 'What is the writer\'s opinion?',
        options: ['All schools should ban phones completely.', 'Students should not use phones at all.', 'Schools should teach students to use phones with clear rules.', 'Phones are more helpful than harmful.'],
        answer: 2,
        locate: 'A better way is to teach students how to use phones well, and to set clear rules — for example, no phones during lessons, but phones allowed for learning tasks.',
        why: '作者明确反对「一刀切禁止」，主张教学生正确使用并制定明确规则（上课不用、学习任务可用），C 准确概括。',
        trap: 'A 作者说 A complete ban is easy to make but hard to keep，明确不赞成；B 作者承认手机有学习用途；D 作者没有笼统说「利大于弊」，而是强调要有规则地使用。',
      },
      {
        q: 'The writer says "A complete ban is easy to make but hard to keep" in order to ___.',
        options: ['show that bans do not work well', 'prove that phones are necessary', 'criticize parents', 'explain why schools made the rule'],
        answer: 0,
        locate: 'A complete ban is easy to make but hard to keep, and it teaches students nothing about self-control.',
        why: '作者用「容易制定、难以维持」并且「教不会学生自控」来论证完全禁止效果不好，为后文「教学生正确使用」的主张铺路。',
        trap: 'B 作者并非论证手机「必要」，而是说可以用于学习；C 全文未批评家长；D 作者是在评价该规则，而非解释学校为何制定。',
      },
    ],
    express: [],
  },
);

/* 套 2 的阅读表达 */
PASSAGES.find((p) => p.id === 's2-d').express = [
  {
    q: 'What do many schools ask students to do at the start of the day?',
    answer: 'To hand in their phones.',
    accept: [
      'to hand in their phones',
      'hand in their phones',
      'hand in phones',
      'to give their phones to the school',
      'hand in their mobile phones',
    ],
    why: '原文第一段：Many schools now ask students to hand in their phones at the start of the day。',
  },
  {
    q: 'How many hours of phone use was connected with lower reading marks?',
    answer: 'More than three hours a day.',
    accept: ['more than three hours a day', 'over three hours a day', 'more than 3 hours a day', 'three hours', 'more than three hours'],
    why: '原文：those who used their phones for more than three hours a day got lower marks in reading tests。',
  },
  {
    q: 'What two useful things can students do with phones in class?',
    answer: 'They can look up a word and record a science experiment.',
    accept: [
      'they can look up a word and record a science experiment',
      'look up a word and record a science experiment',
      'look up words and record experiments',
      'look up a word record a science experiment or practise pronunciation',
      'look up words and practise pronunciation',
    ],
    why: '原文列举三项：look up a word / record a science experiment / use an app to practise pronunciation，答出任意两项即可。',
  },
  {
    q: 'What does the writer think schools should do?',
    answer: 'Teach students how to use phones well and set clear rules.',
    accept: [
      'teach students how to use phones well and set clear rules',
      'teach students to use phones well',
      'set clear rules',
      'teach them to use phones properly',
      'teach students self-control',
    ],
    why: '原文末段：A better way is to teach students how to use phones well, and to set clear rules。',
  },
];

/* ==========================================================
   扩充篇目：每类（A/B/C/D）各补 2 篇，达到每类 4 篇
   每篇仍严格遵守 locate / why / trap 三字段规范
   ========================================================== */
PASSAGES.push(
  /* ---------- A 篇 3：活动海报 ---------- */
  {
    id: 's3-a', set: 3, level: 'A', type: '应用文',
    title: 'School Clubs Open Day',
    intro: 'A 篇应用文：海报类信息查找。先扫标题与表格结构，再按题干关键词定位，不要从头读。',
    passage: `SCHOOL CLUBS OPEN DAY
Saturday, September 14, 9:00 a.m. – 4:00 p.m.
Come and try any club for free!

【Robot Club】
Room 201 ｜ 9:00 – 10:30 ｜ Mr Zhao
Build a small car that can move by itself.
For students in Grade 8 and 9 only. Max 15 students.

【Cooking Club】
School kitchen ｜ 10:00 – 12:00 ｜ Ms Sun
Learn to make three simple dishes.
All students welcome. Please bring an apron (围裙).

【Photography Club】
School garden ｜ 1:30 – 3:00 ｜ Mr Lin
Learn how to take good photos with a phone.
Bring your own phone or borrow one from the club.

【Drama Club】
Hall ｜ 2:00 – 4:00 ｜ Ms Huang
Act out a short play in English.
You need to read a short passage before you come — pick it up in Room 105.

Note: If you want to join a club after Open Day, fill in the form on the school website before September 20.`,
    questions: [
      {
        q: 'Which club is only for Grade 8 and 9 students?',
        options: ['Robot Club.', 'Cooking Club.', 'Photography Club.', 'Drama Club.'],
        answer: 0,
        locate: 'For students in Grade 8 and 9 only. Max 15 students.',
        why: 'Robot Club 部分明确写了「仅限 8、9 年级学生」，其他三个社团都写 All students welcome 或未设年级限制。',
        trap: 'B 写的是 All students welcome；C、D 均未设年级限制，属于把 Robot Club 的条件安到别的社团上。',
      },
      {
        q: 'What should students bring to the Cooking Club?',
        options: ['A phone.', 'An apron.', 'A short passage.', 'A small car.'],
        answer: 1,
        locate: 'All students welcome. Please bring an apron (围裙).',
        why: 'Cooking Club 的说明里明确要求带围裙（apron）。',
        trap: 'A 手机是 Photography Club 要求的；C 短文是 Drama Club 要求提前读的；D 小车是 Robot Club 要做的作品。',
      },
      {
        q: 'If a student wants to join Drama Club, what must he do BEFORE Open Day?',
        options: ['Fill in a form online.', 'Borrow a phone.', 'Read a short passage.', 'Pay a small fee.'],
        answer: 2,
        locate: 'You need to read a short passage before you come — pick it up in Room 105.',
        why: '定位句说「来之前需要读一篇短文」，并说明去 105 室领取，C 正确。',
        trap: 'A 网上填表是 Open Day 之后加入社团的步骤，不是 Open Day 之前；B 是摄影社的事；D 全文标明日免费（for free）。',
      },
      {
        q: 'What is the purpose of this poster?',
        options: ['To sell tickets for a play.', 'To introduce clubs and invite students to try them.', 'To look for new teachers.', 'To report a school event.'],
        answer: 1,
        locate: 'Come and try any club for free!',
        why: '海报标题是「社团开放日」，首句邀请「来免费体验任何社团」，全文列出四个社团的时间地点，目的是介绍并邀请体验。',
        trap: 'A 戏剧社只是四个社团之一，不卖票；C 全文是招学生不是招老师；D 这是活动预告而非事后报道。',
      },
    ],
    express: [],
  },

  /* ---------- A 篇 4：时间表 ---------- */
  {
    id: 's4-a', set: 4, level: 'A', type: '应用文',
    title: 'A Day Trip to the Science Museum',
    intro: 'A 篇应用文：行程表类。注意时间顺序与「先后关系」，这类题最爱考「几点做什么」。',
    passage: `CLASS 2 DAY TRIP — SCIENCE MUSEUM
Friday, October 18

7:40  Meet at the school gate. Do not be late — the bus leaves at 7:50.
8:00  Bus leaves. Journey takes about 50 minutes.
8:50  Arrive at the museum. Teacher gives out worksheets.
9:00  Visit Room 1: Space and Rockets. Watch a short film first.
10:30 Visit Room 2: The Human Body. Try the "How fast can you run?" game.
12:00 Lunch in the museum garden. Bring your own lunch — the café is closed for repairs.
1:00  Free time in Room 3: Future Technology. You may buy small gifts here.
2:30  Meet at the front desk. Hand in your worksheet.
3:00  Bus leaves for school.
4:00  Arrive back at school.

Remember:
• Wear your school uniform.
• Do not touch the models in Room 1.
• Photos are allowed everywhere except Room 1.`,
    questions: [
      {
        q: 'What time does the bus leave the school?',
        options: ['7:40.', '7:50.', '8:00.', '8:50.'],
        answer: 1,
        locate: '7:40  Meet at the school gate. Do not be late — the bus leaves at 7:50.',
        why: '定位句明确区分了两件事：7:40 在校门口集合，7:50 发车。问的是发车时间，答 7:50。',
        trap: 'A 7:40 是集合时间，不是发车时间——这是本题最大的坑；C 8:00 是行程表的下一项（车已出发后的记录）；D 8:50 是到达博物馆时间。',
      },
      {
        q: 'Why must students bring their own lunch?',
        options: ['The café is closed.', 'Lunch is too expensive.', 'There is no time to eat.', 'The museum has no restaurant.'],
        answer: 0,
        locate: 'Lunch in the museum garden. Bring your own lunch — the café is closed for repairs.',
        why: '定位句用破折号给出原因：咖啡馆因维修关闭，所以要自带午餐。',
        trap: 'B 全文未提价格；C 12:00 到 1:00 有整小时午餐时间；D 原文说咖啡馆是「关闭维修」，不是「没有餐厅」。',
      },
      {
        q: 'In which room are students NOT allowed to take photos?',
        options: ['Room 1.', 'Room 2.', 'Room 3.', 'The garden.'],
        answer: 0,
        locate: 'Photos are allowed everywhere except Room 1.',
        why: '定位句说「除 1 号厅外，到处都可以拍照」，因此 1 号厅不能拍照。except 是关键词。',
        trap: 'B、C、D 都在「除 1 号厅外」的范围内，可以拍照。漏看 except 会选错。',
      },
      {
        q: 'What should students do at 2:30?',
        options: ['Buy small gifts.', 'Hand in the worksheet.', 'Watch a film.', 'Get on the bus.'],
        answer: 1,
        locate: '2:30  Meet at the front desk. Hand in your worksheet.',
        why: '行程表 2:30 对应「在前台集合，上交学习单」，B 正确。',
        trap: 'A 买东西在 1:00 的自由活动时间；C 看电影是 9:00 在 1 号厅；D 3:00 才发车返校。',
      },
    ],
    express: [],
  },

  /* ---------- B 篇 3：记叙文（成长类） ---------- */
  {
    id: 's3-b', set: 3, level: 'B', type: '记叙文',
    title: 'The Day I Lost the Race',
    intro: 'B 篇记叙文：成长类。注意「结果输了但收获了什么」，这类文章的主旨题答案往往不是表面结果。',
    passage: `I had trained for the school 800-metre race for three months. Every morning I ran six laps before class. My father, who had been a runner himself, timed me with an old watch.

On the day of the race, I felt strong. When the gun went off, I ran fast and soon was in second place. With 200 metres to go, I could see the boy in front of me. I decided to pass him.

Then my left leg gave a sharp pain. I fell on the track. The other runners passed me one by one. I tried to stand up but my leg would not hold me.

I wanted to give up. Then I heard my father's voice from the side: "Finish it. However slow."

So I did. I limped the last 200 metres. The other runners had already finished and were drinking water. When I crossed the line, the whole playground was quiet — and then people began to clap. It was not the loud clapping for the winner. It was something different, quieter.

My father met me at the finish line. He did not say "Bad luck" or "You should have been more careful". He said, "You finished."

Later, my leg got better, but I never ran that fast again. I sometimes think about that afternoon. I did not win anything, and there was no medal for me. But I learned something that day that no medal could teach me: the race is not only about who is fastest. It is also about what you do after you fall.`,
    questions: [
      {
        q: 'How long had the writer trained before the race?',
        options: ['Three weeks.', 'Three months.', 'Six months.', 'One year.'],
        answer: 1,
        locate: 'I had trained for the school 800-metre race for three months.',
        why: '定位句直接写明训练了三个月（three months）。',
        trap: 'A 把「三个月」错记成「三周」；C、D 原文无依据。注意题干里的「每周六圈」是每天的跑量，不是训练时长。',
      },
      {
        q: 'What happened when the writer tried to pass the runner in front?',
        options: ['He won the race.', 'His leg hurt and he fell.', 'He stopped to rest.', 'The other runner fell too.'],
        answer: 1,
        locate: 'I decided to pass him. Then my left leg gave a sharp pain. I fell on the track.',
        why: '定位句紧接在「决定超过他」之后：左腿剧痛、摔倒在跑道上，B 正确。',
        trap: 'A 结果是他摔倒了，没赢；C 他是想站起来但腿撑不住，不是主动停下休息；D 原文没有别人摔倒。',
      },
      {
        q: 'Why did the people clap when the writer crossed the line?',
        options: ['Because he won the race.', 'Because he broke a record.', 'Because he finished despite the pain.', 'Because his father asked them to.'],
        answer: 2,
        locate: 'I limped the last 200 metres. ... When I crossed the line, the whole playground was quiet — and then people began to clap. It was not the loud clapping for the winner. It was something different, quieter.',
        why: '原文特意说明「那不是给冠军的热烈掌声，而是另一种、更安静的」，结合他带伤走完全程，可知掌声是敬佩他的坚持，C 正确。',
        trap: 'A 原文明确说这不是给冠军的掌声；B 全文没提纪录；D 原文没有父亲号召观众的情节。',
      },
      {
        q: 'What did the writer learn from that day?',
        options: ['He should train harder next time.', 'Winning is the most important thing.', 'What you do after falling matters.', 'He should not run long races.'],
        answer: 2,
        locate: 'the race is not only about who is fastest. It is also about what you do after you fall.',
        why: '结尾句是全文主旨：比赛不只是比谁最快，还在于你跌倒之后做了什么。C 是原文的直接对应。',
        trap: 'A 原文说「后来腿好了，但再没跑那么快」，重点不在训练量；B 与「不只是比谁最快」相反；D 原文无此结论。',
      },
    ],
    express: [],
  },

  /* ---------- B 篇 4：记叙文（亲情类） ---------- */
  {
    id: 's4-b', set: 4, level: 'B', type: '记叙文',
    title: 'My Grandfather\'s Letters',
    intro: 'B 篇记叙文：亲情类。注意「物件」贯穿全文的作用，这类题常考「某个东西象征什么」。',
    passage: `When my grandfather died, my mother found a wooden box in his desk. Inside were forty-two letters, all written by my grandmother.

My grandmother died when my mother was only six. My mother had almost no memory of her. "I only remember her hands," she said once. "And a song she used to sing."

The letters were written between 1962 and 1965, when my grandfather worked in a factory far from home. He came back only twice a year. So they wrote to each other — every week, for three years.

My mother asked me to read them aloud. The first letters were about small things: whether the vegetables in the garden had come up, whether the roof leaked. Then they became about my mother as a baby — her first tooth, her first step, the way she laughed.

One letter, written in winter, said: "She took her first steps today. She walked to the door and looked out, as if she were waiting for you. I told her you would come home soon. I hope I did not tell a lie."

My grandfather kept these letters for over fifty years. He never spoke about them. But he kept every one.

Now the box sits on my desk. Sometimes, when I am tired or unhappy, I open it and read one letter. I never met my grandmother. But through these letters, I feel I know her a little — a woman who wrote about vegetables and roofs and first steps, and who loved my grandfather enough to write to him every week for three years.`,
    questions: [
      {
        q: 'How many letters were in the box?',
        options: ['Twenty-four.', 'Forty-two.', 'Fifty.', 'Sixty-five.'],
        answer: 1,
        locate: 'Inside were forty-two letters, all written by my grandmother.',
        why: '定位句直接写明盒子里有四十二封信（forty-two）。',
        trap: 'A 把数字记反了；C 五十是「保存了五十多年」，不是信的数量；D 六十五是「1965 年」，属张冠李戴。',
      },
      {
        q: 'Why did the grandparents write letters to each other?',
        options: ['They had no telephone.', 'The grandfather worked far from home and came back only twice a year.', 'They liked writing better than talking.', 'The grandmother was often ill.'],
        answer: 1,
        locate: 'The letters were written between 1962 and 1965, when my grandfather worked in a factory far from home. He came back only twice a year.',
        why: '定位句说明祖父在外地工厂工作、一年只回两次家，因此靠写信联系，B 完整概括。',
        trap: 'A 原文没提有没有电话，属于自行推测；C 原文无此说法；D 祖母确实早逝，但那不是写信的原因。',
      },
      {
        q: 'What was the winter letter mainly about?',
        options: ['The leaking roof.', 'The writer\'s mother taking her first steps.', 'The grandfather coming home.', 'The vegetables in the garden.'],
        answer: 1,
        locate: 'She took her first steps today. She walked to the door and looked out, as if she were waiting for you.',
        why: '定位句明确：冬天那封信写的是「她今天迈出了第一步」，B 正确。',
        trap: 'A 漏雨的屋顶是早期信件的内容；C 信里说的是「告诉孩子爸爸很快回来」，不是他真的回来了；D 蔬菜也是早期内容。',
      },
      {
        q: 'Why does the writer sometimes read the letters?',
        options: ['To practise reading aloud.', 'To feel close to a grandmother he never met.', 'To find out about the old factory.', 'To copy her handwriting.'],
        answer: 1,
        locate: 'I never met my grandmother. But through these letters, I feel I know her a little',
        why: '结尾句说明：虽然从没见过祖母，但通过这些信觉得自己对她有所了解，因此读信是为了接近这位未曾谋面的祖母。',
        trap: 'A 朗读只是当年母亲的请求，不是现在读信的目的；C 工厂只是背景信息；D 原文未提临摹字迹。',
      },
    ],
    express: [],
  },

  /* ---------- C 篇 3：说明文（科普） ---------- */
  {
    id: 's3-c', set: 3, level: 'C', type: '说明文',
    title: 'How Do Chameleons Change Colour?',
    intro: 'C 篇说明文：科普类。注意「常见误解 → 科学解释」的结构，这类文章最爱考「以下哪个说法是错的」。',
    passage: `Most people believe that chameleons change colour to match their surroundings. This is one of the most common ideas about animals — and it is mostly wrong.

Chameleons do change colour, but usually not to hide. Scientists have found that colour change has three main purposes.

The first is temperature. Like all reptiles, chameleons cannot make their own body heat. In the morning, when they are cold, they become darker, because dark colours take in more sunlight. By midday, when they are too warm, they turn lighter to reflect the sun.

The second is communication. A male chameleon may turn bright colours to show other males that this is his area. A female that is not ready to lay eggs may turn dark with bright spots, which tells males to stay away.

The third is mood. A frightened chameleon often turns pale. A sick one may become very dark.

So why do people think chameleons match their surroundings? The idea probably came from one kind of chameleon that lives in grass and is naturally green. But even this animal does not change colour to match what it stands on — it is simply green all the time.

How do they do it? Under their skin, chameleons have special cells containing tiny crystals. By changing the distance between these crystals, the animal changes which colours of light are reflected. It is not paint, and it is not dye. It is more like the way a soap bubble shows different colours.`,
    questions: [
      {
        q: 'What is the common belief about chameleons mentioned in the first paragraph?',
        options: ['They are dangerous.', 'They change colour to match their surroundings.', 'They live only in grass.', 'They cannot see colours.'],
        answer: 1,
        locate: 'Most people believe that chameleons change colour to match their surroundings.',
        why: '定位句直接说明：多数人相信变色龙变色是为了与周围环境相配。',
        trap: 'A、D 原文均未提及；C 只适用于「一种生活在草里的变色龙」，被扩大成全部。',
      },
      {
        q: 'Why does a chameleon become darker in the morning?',
        options: ['To hide from enemies.', 'To take in more sunlight and get warm.', 'To show it is angry.', 'To attract a female.'],
        answer: 1,
        locate: 'In the morning, when they are cold, they become darker, because dark colours take in more sunlight.',
        why: '定位句用 because 给出原因：深色吸收更多阳光，帮助取暖。这属于「调节体温」这一目的。',
        trap: 'A 正是文章要纠正的误解；C 情绪确实影响颜色，但早晨变深是温度原因；D 吸引异性属于「交流」目的，且是雄性用鲜艳颜色。',
      },
      {
        q: 'According to the passage, which is NOT a purpose of colour change?',
        options: ['To control body temperature.', 'To communicate with other chameleons.', 'To show mood.', 'To match the colour of leaves exactly.'],
        answer: 3,
        locate: 'Chameleons do change colour, but usually not to hide. ... But even this animal does not change colour to match what it stands on — it is simply green all the time.',
        why: '原文明确否定「变色为了与环境相配」：变色通常不是为了躲藏，那种绿色的变色龙也不是为了匹配脚下物体。因此 D 不是变色目的。',
        trap: 'A、B、C 分别对应原文列出的三个目的（温度、交流、情绪），都是真实的。本题问「不是」，要选被否定的那项。',
      },
      {
        q: 'How do chameleons change colour?',
        options: ['By producing different paints.', 'By changing the distance between tiny crystals in their skin.', 'By moving to a different place.', 'By drinking coloured water.'],
        answer: 1,
        locate: 'By changing the distance between these crystals, the animal changes which colours of light are reflected.',
        why: '定位句说明：通过改变皮肤内微小晶体之间的距离，改变反射的光的颜色。',
        trap: 'A 原文明确说 It is not paint（不是颜料）；C 变色是身体变化，不是换地方；D 原文未提。',
      },
    ],
    express: [],
  },

  /* ---------- C 篇 4：说明文（社会现象） ---------- */
  {
    id: 's4-c', set: 4, level: 'C', type: '说明文',
    title: 'Why Do We Forget Names?',
    intro: 'C 篇说明文：心理科普。注意「列举原因」的结构，这类题常考「以下哪项是原因之一」。',
    passage: `You meet someone at a party. Two minutes later, you have forgotten the name. You are not alone — forgetting names is one of the most common memory problems, and scientists think they know why.

First, names are arbitrary. A word like "table" carries meaning: you can picture a table. But a name like "Sarah" tells you nothing about the person. Your brain remembers meaning much better than sound, so names slip away.

Second, you often hear a name only once, at a moment when you are busy — shaking hands, thinking what to say next. In one study, people remembered only about 10 percent of the names they heard in a conversation, but about 90 percent of the jobs those people did. Why? Because "doctor" or "teacher" comes with pictures and ideas, while a name does not.

Third, names are easily confused with other names. If you meet three people called Li Wei in one month, your brain may mix them up. This is called interference.

The good news is that you can train yourself. One simple method is to repeat the name right after you hear it: "Nice to meet you, Sarah." Another is to connect the name with something you can see — a person named Bai, which means "white" in Chinese, might be wearing a white shirt. A third is to use the name again before you leave: "Goodbye, Sarah."

None of these methods is magic. But they work because they turn a meaningless sound into something your brain can hold on to — and that is exactly what memory needs.`,
    questions: [
      {
        q: 'Why are names harder to remember than words like "table"?',
        options: ['Names are longer.', 'Names carry no meaning, while "table" does.', 'Names are said more quietly.', 'Names are in a foreign language.'],
        answer: 1,
        locate: 'A word like "table" carries meaning: you can picture a table. But a name like "Sarah" tells you nothing about the person.',
        why: '定位句对比说明：table 有意义、能想象出画面；而名字不携带关于这个人的任何信息。',
        trap: 'A 名字通常并不更长（Sarah 比 table 长不了多少，且这不是原因）；C、D 原文均未提及。',
      },
      {
        q: 'In the study, why did people remember jobs better than names?',
        options: ['Jobs are more important.', 'Jobs come with pictures and ideas.', 'People say jobs more loudly.', 'Jobs are shorter words.'],
        answer: 1,
        locate: 'Because "doctor" or "teacher" comes with pictures and ideas, while a name does not.',
        why: '定位句用 because 说明原因：职业词能唤起画面和概念，名字不能。',
        trap: 'A 是主观判断，原文未以此解释；C、D 原文均未提及。',
      },
      {
        q: 'What does "interference" mean in the passage?',
        options: ['Forgetting where you met someone.', 'Mixing up names that are the same or similar.', 'Being too busy to listen.', 'Not liking a person\'s name.'],
        answer: 1,
        locate: 'If you meet three people called Li Wei in one month, your brain may mix them up. This is called interference.',
        why: '原文用「一个月遇到三个李伟，大脑会混淆」来解释 interference，随后点名 This is called interference，指的是相似名字互相干扰、混淆。',
        trap: 'A 原文未提忘记见面地点；C 是「只听到一次」这一原因的内容，不是 interference；D 原文未提喜好。',
      },
      {
        q: 'What is the main idea of the last paragraph?',
        options: ['These methods are difficult to learn.', 'These methods help because they give the name meaning.', 'Only clever people can remember names.', 'Names are not important at all.'],
        answer: 1,
        locate: 'But they work because they turn a meaningless sound into something your brain can hold on to — and that is exactly what memory needs.',
        why: '末段总结：这些方法之所以有效，是因为把无意义的声音变成了大脑能抓住的东西。B 是这句话的准确概括。',
        trap: 'A 原文说这些方法 simple，不是难学；C 原文未提智力差异；D 与全文主旨相反。',
      },
    ],
    express: [],
  },

  /* ---------- D 篇 3：议论文（科技与生活） ---------- */
  {
    id: 's3-d', set: 3, level: 'D', type: '议论文',
    title: 'Should Students Learn to Code?',
    intro: 'D 篇议论文：注意「双方都有道理」的写法，作者可能给出折中观点。警惕绝对化选项（all / never / only）。',
    passage: `In recent years, many countries have made computer programming a required subject in schools. Supporters say coding is a basic skill for the future, like reading and writing. Critics say not every student needs to become a programmer.

Those in favour make a practical point: computers are everywhere, and understanding how they work helps people use them better. A student who has written a simple program understands why a machine follows instructions — and why it sometimes fails. This knowledge is useful whether or not the student becomes an engineer.

Supporters also argue that coding teaches thinking. To write a program, you must break a big problem into small steps and check each step. This way of thinking can be used in maths, in science, and even in planning a trip.

But critics raise two concerns. The first is time. School hours are limited, and every new subject takes time from something else. If coding is required, what should be dropped — music, art, or physical education? The second is that technology changes fast. The programming language taught today may be out of date in ten years. Teaching a language, critics say, is less important than teaching students how to learn new things.

A third group takes a middle position. They say coding should be offered, but not required — at least not at first. Students who are interested can choose it, and schools can see how it works before making it compulsory.

My own view is close to this middle position. I do not think every student must learn to code, any more than every student must learn to play the violin. But I do think every student should have the chance to try it, because you cannot know whether you like something until you have tried it.`,
    questions: [
      {
        q: 'What do supporters compare coding to?',
        options: ['A hobby like music.', 'A basic skill like reading and writing.', 'A difficult sport.', 'A language that will disappear.'],
        answer: 1,
        locate: 'Supporters say coding is a basic skill for the future, like reading and writing.',
        why: '定位句直接说：支持者把编程比作面向未来的基本技能，就像读和写一样。',
        trap: 'A 音乐是反对者提到的「可能被挤掉的科目」；C 原文未提体育以外的比较；D 是反对者关于「语言会过时」的担忧，不是支持者的比喻。',
      },
      {
        q: 'What is one of the critics\' concerns?',
        options: ['Coding is too easy for students.', 'School hours are limited and something must be dropped.', 'Computers are too expensive.', 'Students already know how to code.'],
        answer: 1,
        locate: 'The first is time. School hours are limited, and every new subject takes time from something else.',
        why: '定位句说明反对者的第一个担忧是时间：课时有限，新增科目必然挤占其他内容。',
        trap: 'A 与原文相反（原文担心的是难度与时效，不是太简单）；C 原文未提设备费用；D 原文未说学生已会编程。',
      },
      {
        q: 'Why do critics think teaching a specific language is less important?',
        options: ['Languages are too hard to learn.', 'Technology changes fast and today\'s language may be out of date.', 'Only English is useful.', 'Students forget languages quickly.'],
        answer: 1,
        locate: 'The second is that technology changes fast. The programming language taught today may be out of date in ten years.',
        why: '定位句说明第二个担忧：技术变化快，今天教的编程语言十年后可能已过时，所以教「如何学习新事物」比教具体语言更重要。',
        trap: 'A 原文未说太难；C 原文与「英语」无关；D 原文未提遗忘速度。',
      },
      {
        q: 'What is the writer\'s own view?',
        options: ['Coding must be required for everyone.', 'Coding should not be taught at all.', 'Coding should be offered so students can try it.', 'Only students who like maths should learn coding.'],
        answer: 2,
        locate: 'But I do think every student should have the chance to try it, because you cannot know whether you like something until you have tried it.',
        why: '作者明确说：不认为每个学生都必须学，但每个学生都应该有机会尝试。C 准确概括。',
        trap: 'A 与「不认为每个学生都必须学」相反；B 与「应该有机会尝试」相反；D 原文未以数学成绩作为筛选条件。',
      },
      {
        q: 'The writer mentions "playing the violin" in order to ___.',
        options: ['show that music is more important than coding', 'explain that not every skill must be required of everyone', 'prove that coding is difficult', 'criticize music teachers'],
        answer: 1,
        locate: 'I do not think every student must learn to code, any more than every student must learn to play the violin.',
        why: 'any more than 是类比结构：正如不必要求人人学小提琴，也不必要求人人学编程。作者用小提琴作类比，说明「不是每项技能都必须人人必修」。',
        trap: 'A 作者没有比较音乐与编程的重要性；C 类比的重点不是难度；D 全文没有批评音乐老师。',
      },
    ],
    express: [],
  },

  /* ---------- D 篇 4：议论文（环境保护） ---------- */
  {
    id: 's4-d', set: 4, level: 'D', type: '议论文',
    title: 'Is It Worth Recycling?',
    intro: 'D 篇议论文：环境议题。注意作者如何处理「反方有理」的部分——承认部分合理但仍坚持主张。',
    passage: `Recycling is one of the first things we are taught about protecting the environment. But in recent years, some people have begun to ask: is it really worth the effort?

The doubters point to some real problems. Recycling paper, for example, uses water and energy. If a truck drives across the city to collect a small amount of paper, the pollution from the truck may be greater than the good the recycling does. In some cities, collected plastic has been found in rivers and fields because there was no factory to process it.

These are serious points, and they should not be laughed at. But they do not prove that recycling is useless. They prove that recycling must be done well.

Consider paper. A study found that recycling paper uses about 60 percent less energy than making new paper from trees. It also saves trees and reduces the amount of waste going into the ground. The key is scale: it works when there is enough material to fill a truck, and when the factory is not too far away.

Plastic is harder. Not all plastic can be recycled, and mixing different kinds makes the result worse. This is why many places now ask people to separate plastic carefully, and why some have stopped accepting certain kinds altogether.

So what should we do? The honest answer is that recycling alone will not solve the problem. We also need to buy less and use things longer. But "recycling is not enough" is very different from "recycling is useless". The first is true; the second is not.

A good habit is not a magic answer. It is simply better than a bad one.`,
    questions: [
      {
        q: 'What problem with paper recycling do the doubters mention?',
        options: ['It produces too much paper.', 'Collecting and processing it uses water, energy and transport.', 'Nobody wants recycled paper.', 'It costs too much money for families.'],
        answer: 1,
        locate: 'Recycling paper, for example, uses water and energy. If a truck drives across the city to collect a small amount of paper, the pollution from the truck may be greater than the good the recycling does.',
        why: '定位句列出怀疑者的两点理由：回收纸张消耗水和能源；运输过程产生的污染可能超过收益。B 概括了这两点。',
        trap: 'A 原文说回收是减少用纸，不是产生更多纸；C 原文未提市场需求；D 原文未以家庭费用为论据。',
      },
      {
        q: 'What did the study about paper show?',
        options: ['Recycling paper is always better than making new paper.', 'Recycling paper uses about 60% less energy than making new paper.', 'New paper is cleaner than recycled paper.', 'Paper cannot be recycled twice.'],
        answer: 1,
        locate: 'A study found that recycling paper uses about 60 percent less energy than making new paper from trees.',
        why: '定位句给出数据：回收纸比用树木造新纸少用约 60% 的能源。',
        trap: 'A 用了 always（总是），过于绝对——作者强调「规模合适时才有效」，与 always 矛盾；C 原文未比较清洁度；D 原文未提回收次数。',
      },
      {
        q: 'Why is plastic harder to recycle than paper?',
        options: ['Plastic is heavier.', 'Not all plastic can be recycled, and mixing kinds makes it worse.', 'There is not enough plastic.', 'People do not use plastic.'],
        answer: 1,
        locate: 'Plastic is harder. Not all plastic can be recycled, and mixing different kinds makes the result worse.',
        why: '定位句直接给出两点原因：并非所有塑料都能回收；混合不同种类会让结果更差。',
        trap: 'A 原文未提重量；C 原文说有些地方停止接收某些塑料，与「不够多」不同；D 与常识和原文都矛盾。',
      },
      {
        q: 'What is the writer\'s conclusion?',
        options: ['Recycling is useless and should be stopped.', 'Recycling alone is not enough, but it is still worth doing.', 'Recycling will solve all environmental problems.', 'Only paper should be recycled.'],
        answer: 1,
        locate: 'The honest answer is that recycling alone will not solve the problem. ... But "recycling is not enough" is very different from "recycling is useless". The first is true; the second is not.',
        why: '作者明确区分两句话：回收「不够」是真的，回收「无用」是假的。因此结论是「仅靠回收不够，但仍值得做」，B 准确。',
        trap: 'A 正是作者否定的「recycling is useless」；C 与「回收本身解决不了问题」矛盾；D 原文也讨论了塑料，未主张只回收纸。',
      },
      {
        q: 'The sentence "A good habit is not a magic answer" in the last paragraph means ___.',
        options: ['good habits do not work', 'a good habit helps even though it cannot solve everything', 'we should not form habits', 'magic is better than habits'],
        answer: 1,
        locate: 'A good habit is not a magic answer. It is simply better than a bad one.',
        why: '下一句是解释：「它只是比坏习惯好」。因此这句话的意思是「好习惯有帮助，但不是万能的解法」，B 正确。',
        trap: 'A 与「比坏习惯好」矛盾；C 原文鼓励形成好习惯；D 是字面误解，magic 在这里是比喻。',
      },
    ],
    express: [],
  },
);

/* 为新增 4 篇补阅读表达（每套 4 题，对齐北京卷 4 小题） */
PASSAGES.find((p) => p.id === 's3-a').express = [
  {
    q: 'Which club requires students to read something before Open Day?',
    answer: 'The Drama Club.',
    accept: ['the drama club', 'drama club', 'drama'],
    why: 'Drama Club 部分：You need to read a short passage before you come。',
  },
  {
    q: 'Where should students go to pick up the passage?',
    answer: 'Room 105.',
    accept: ['room 105', 'in room 105', '105'],
    why: '原文：pick it up in Room 105。',
  },
  {
    q: 'When must students fill in the form to join a club?',
    answer: 'Before September 20.',
    accept: ['before september 20', 'september 20', 'before sept 20', 'by september 20'],
    why: '原文 Note：fill in the form on the school website before September 20。',
  },
  {
    q: 'How long does the Photography Club last?',
    answer: 'One and a half hours.',
    accept: ['one and a half hours', '1.5 hours', 'an hour and a half', '90 minutes', 'one hour and a half'],
    why: 'Photography Club 时间是 1:30 – 3:00，共 1.5 小时。',
  },
];

PASSAGES.find((p) => p.id === 's3-b').express = [
  {
    q: 'How many metres was the race?',
    answer: '800 metres.',
    accept: ['800 metres', '800 meters', '800', 'eight hundred metres', 'eight hundred meters'],
    why: '原文首句：the school 800-metre race。',
  },
  {
    q: 'What did the writer\'s father say when he met him at the finish line?',
    answer: 'He said "You finished."',
    accept: ['you finished', 'he said you finished', 'finished'],
    why: '原文：He said, "You finished."',
  },
  {
    q: 'How did the writer finish the race?',
    answer: 'He limped the last 200 metres.',
    accept: ['he limped the last 200 metres', 'limped', 'he limped', 'walked slowly', 'limped the last 200 meters'],
    why: '原文：I limped the last 200 metres。',
  },
  {
    q: 'What did the writer learn that day?',
    answer: 'The race is also about what you do after you fall.',
    accept: [
      'the race is also about what you do after you fall',
      'what you do after you fall matters',
      'what you do after falling',
      'never give up',
      'to finish what you start',
    ],
    why: '原文结尾：It is also about what you do after you fall。',
  },
];

PASSAGES.find((p) => p.id === 's3-c').express = [
  {
    q: 'What do most people wrongly believe about chameleons?',
    answer: 'That they change colour to match their surroundings.',
    accept: [
      'that they change colour to match their surroundings',
      'they change colour to match their surroundings',
      'to match their surroundings',
      'they change color to hide',
    ],
    why: '原文第一段：Most people believe that chameleons change colour to match their surroundings ... it is mostly wrong。',
  },
  {
    q: 'How many purposes of colour change are mentioned?',
    answer: 'Three.',
    accept: ['three', '3', 'three purposes', '3 purposes'],
    why: '原文：colour change has three main purposes（temperature, communication, mood）。',
  },
  {
    q: 'What do chameleons have under their skin that helps them change colour?',
    answer: 'Special cells containing tiny crystals.',
    accept: [
      'special cells containing tiny crystals',
      'cells containing tiny crystals',
      'tiny crystals',
      'special cells',
      'crystals',
    ],
    why: '原文：Under their skin, chameleons have special cells containing tiny crystals。',
  },
  {
    q: 'What does the writer compare the colour change to?',
    answer: 'The way a soap bubble shows different colours.',
    accept: [
      'the way a soap bubble shows different colours',
      'a soap bubble',
      'soap bubble',
      'the way a soap bubble shows different colors',
    ],
    why: '原文末句：It is more like the way a soap bubble shows different colours。',
  },
];

PASSAGES.find((p) => p.id === 's3-d').express = [
  {
    q: 'What do supporters say coding is like?',
    answer: 'A basic skill like reading and writing.',
    accept: ['a basic skill like reading and writing', 'reading and writing', 'a basic skill', 'like reading and writing'],
    why: '原文：Supporters say coding is a basic skill for the future, like reading and writing。',
  },
  {
    q: 'What is the critics\' first concern about teaching coding?',
    answer: 'School hours are limited and something must be dropped.',
    accept: [
      'school hours are limited and something must be dropped',
      'school hours are limited',
      'there is not enough time',
      'time',
      'it takes time from other subjects',
    ],
    why: '原文：The first is time. School hours are limited, and every new subject takes time from something else。',
  },
  {
    q: 'Why may the programming language taught today become useless?',
    answer: 'Because technology changes fast.',
    accept: ['because technology changes fast', 'technology changes fast', 'technology changes quickly', 'technology changes'],
    why: '原文：The second is that technology changes fast. The programming language taught today may be out of date in ten years。',
  },
  {
    q: 'What does the writer think every student should have?',
    answer: 'The chance to try coding.',
    accept: ['the chance to try coding', 'a chance to try it', 'the chance to try it', 'a chance to try coding', 'the opportunity to try coding'],
    why: '原文：I do think every student should have the chance to try it。',
  },
];

PASSAGES.find((p) => p.id === 's4-a').express = [
  {
    q: 'What time do students meet at the school gate?',
    answer: 'At 7:40.',
    accept: ['at 7:40', '7:40', 'at seven forty', 'seven forty'],
    why: '行程表：7:40 Meet at the school gate。',
  },
  {
    q: 'How long does the bus journey take?',
    answer: 'About 50 minutes.',
    accept: ['about 50 minutes', '50 minutes', 'fifty minutes', 'about fifty minutes'],
    why: '行程表：8:00 Bus leaves. Journey takes about 50 minutes。',
  },
  {
    q: 'What must students wear on the trip?',
    answer: 'Their school uniform.',
    accept: ['their school uniform', 'school uniform', 'the school uniform', 'uniform'],
    why: 'Remember 部分：Wear your school uniform。',
  },
  {
    q: 'What must students do at 2:30?',
    answer: 'Meet at the front desk and hand in the worksheet.',
    accept: [
      'meet at the front desk and hand in the worksheet',
      'hand in the worksheet',
      'hand in their worksheet',
      'meet at the front desk',
    ],
    why: '行程表：2:30 Meet at the front desk. Hand in your worksheet。',
  },
];

PASSAGES.find((p) => p.id === 's4-b').express = [
  {
    q: 'Who wrote the letters in the box?',
    answer: 'The writer\'s grandmother.',
    accept: ["the writer's grandmother", 'his grandmother', 'the grandmother', 'grandmother', 'my grandmother'],
    why: '原文：Inside were forty-two letters, all written by my grandmother。',
  },
  {
    q: 'How often did the grandfather come home?',
    answer: 'Twice a year.',
    accept: ['twice a year', 'two times a year', 'twice every year'],
    why: '原文：He came back only twice a year。',
  },
  {
    q: 'What did the writer\'s mother remember about her mother?',
    answer: 'Her hands and a song she used to sing.',
    accept: [
      'her hands and a song she used to sing',
      'her hands',
      'a song',
      'hands and a song',
    ],
    why: '原文：I only remember her hands ... And a song she used to sing。',
  },
  {
    q: 'How long did the grandfather keep the letters?',
    answer: 'Over fifty years.',
    accept: ['over fifty years', 'fifty years', 'more than fifty years', '50 years', 'over 50 years'],
    why: '原文：My grandfather kept these letters for over fifty years。',
  },
];

PASSAGES.find((p) => p.id === 's4-c').express = [
  {
    q: 'What percentage of names did people remember in the study?',
    answer: 'About 10 percent.',
    accept: ['about 10 percent', '10 percent', '10%', 'about 10%', 'ten percent'],
    why: '原文：people remembered only about 10 percent of the names they heard。',
  },
  {
    q: 'Why does the brain remember "table" better than "Sarah"?',
    answer: 'Because "table" carries meaning, while a name does not.',
    accept: [
      'because table carries meaning while a name does not',
      'table carries meaning',
      'names carry no meaning',
      'because names have no meaning',
    ],
    why: '原文：A word like "table" carries meaning ... But a name like "Sarah" tells you nothing about the person。',
  },
  {
    q: 'What is "interference"?',
    answer: 'Mixing up names that are the same or similar.',
    accept: [
      'mixing up names that are the same or similar',
      'mixing up names',
      'mixing similar names',
      'confusing names',
    ],
    why: '原文：your brain may mix them up. This is called interference。',
  },
  {
    q: 'What is one method the passage suggests for remembering names?',
    answer: 'Repeat the name right after you hear it.',
    accept: [
      'repeat the name right after you hear it',
      'repeat the name',
      'connect the name with something you can see',
      'use the name again before you leave',
      'say the name again',
    ],
    why: '原文列举三种方法：重复名字、把名字与看得见的东西联系、离开前再用一次名字。答出任一即可。',
  },
];

PASSAGES.find((p) => p.id === 's4-d').express = [
  {
    q: 'What is the doubters\' example of a recycling problem?',
    answer: 'Recycling paper uses water and energy, and trucks cause pollution.',
    accept: [
      'recycling paper uses water and energy and trucks cause pollution',
      'recycling paper uses water and energy',
      'the truck causes pollution',
      'transport causes pollution',
      'collecting paper uses water and energy',
      'trucks cause pollution',
    ],
    why: '原文：Recycling paper, for example, uses water and energy. If a truck drives across the city ... the pollution from the truck may be greater。',
  },
  {
    q: 'How much less energy does recycling paper use?',
    answer: 'About 60 percent less.',
    accept: ['about 60 percent less', '60 percent less', '60%', 'about 60%', '60 percent'],
    why: '原文：recycling paper uses about 60 percent less energy than making new paper from trees。',
  },
  {
    q: 'What two things do we also need besides recycling?',
    answer: 'We need to buy less and use things longer.',
    accept: [
      'we need to buy less and use things longer',
      'buy less and use things longer',
      'to buy less and use things longer',
      'buy less',
      'use things longer',
    ],
    why: '原文：We also need to buy less and use things longer。',
  },
  {
    q: 'What does the writer mean by "A good habit is not a magic answer"?',
    answer: 'It helps, but it cannot solve everything.',
    accept: [
      'it helps but it cannot solve everything',
      'it helps but cannot solve all problems',
      'it is better than a bad habit',
      'it helps even though it is not perfect',
      'it is simply better than a bad one',
    ],
    why: '原文下一句解释：It is simply better than a bad one。即「有帮助但不是万能的」。',
  },
];
