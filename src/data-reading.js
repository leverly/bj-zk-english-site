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
