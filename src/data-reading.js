/* ==========================================================
   北京中考英语 · 完形填空与阅读理解
   完形（cloze）：一篇短文挖 8 空，每题 4 选项，对应北京卷「二、完形填空」8 小题
   阅读（reading）：A/B/C/D 四篇，含细节题、推断题、主旨题、词义猜测题
   ========================================================== */

/* ---------------- 完形填空 ---------------- */
export const CLOZE = [
  {
    id: 'cloze-1',
    title: 'A Second Chance',
    level: '基础',
    topic: 'self-study',
    intro: '一个关于坚持与改变的校园故事。',
    passage: [
      'When I was in Grade 7, I was very poor at English. I could hardly read a short story, and I was afraid to speak in class. Every time the teacher asked me a question, my face turned ___(1)___ and I could not say a word.',
      'One day, my English teacher, Ms Li, asked me to stay after class. I thought she would criticize me, but she just smiled and said, "I know you are trying hard. Let us find a ___(2)___ way together."',
      'She gave me a small notebook and told me to write down five new words every day. "Do not try to remember all of them at once," she said. "Just read them, use them, and let them ___(3)___ in your mind slowly."',
      'At first, it was really ___(4)___. I often forgot the words I had learned the day before. But Ms Li kept encouraging me. She said, "Learning a language is like ___(5)___ a tree. You cannot see it grow, but it is growing every day."',
      'I followed her advice for a whole year. I read English stories every night and wrote a short diary in English. Slowly, I found that I could understand more and more. In Grade 8, I even ___(6)___ first prize in an English speech contest.',
      'Looking back, I realize that the most important thing is not how ___(7)___ you are, but whether you are willing to keep going. Everyone can make progress ___(8)___ they never give up.',
    ].join('\n\n'),
    blanks: [
      { n: 1, options: ['red', 'cold', 'pale', 'white'], answer: 0,
        why: '脸变红（turn red）是害羞紧张的典型表现，与后文「说不出话」呼应。' },
      { n: 2, options: ['strange', 'better', 'longer', 'faster'], answer: 1,
        why: '老师要和学生一起找「更好的」方法，与前面「学得很差」形成对比。' },
      { n: 3, options: ['disappear', 'stay', 'change', 'grow'], answer: 1,
        why: '「读它们、用它们，让它们慢慢留在脑海里」——stay in your mind 是固定表达。' },
      { n: 4, options: ['easy', 'interesting', 'hard', 'boring'], answer: 2,
        why: '后面说「经常忘记前一天学的词」，说明过程很「难」。' },
      { n: 5, options: ['climbing', 'planting', 'cutting', 'watering'], answer: 1,
        why: '与后文「你看不到它生长，但它每天都在长」呼应，是「种树」的比喻。' },
      { n: 6, options: ['lost', 'won', 'missed', 'gave'], answer: 1,
        why: 'win first prize（获得一等奖）是固定搭配，且与前面进步形成正向结果。' },
      { n: 7, options: ['tall', 'old', 'clever', 'busy'], answer: 2,
        why: '与后文「愿不愿意坚持下去」对比，强调重要的不是「多聪明」。' },
      { n: 8, options: ['because', 'although', 'unless', 'if'], answer: 3,
        why: '「只要不放弃，每个人都能进步」——if 引导条件状语从句。' },
    ],
    translation: '七年级时我英语很差，几乎读不了一个短故事，也不敢在课上发言。每次老师提问，我的脸就会变红，一个字也说不出来。\n\n有一天，英语老师李老师让我课后留下。我以为她要批评我，但她只是笑着说：「我知道你在努力。让我们一起找个更好的方法吧。」\n\n她给了我一个小本子，让我每天记五个新单词。「不要想着一次全记住，」她说，「只要读它们、用它们，让它们慢慢留在你的脑海里。」\n\n一开始真的很难。我经常忘记前一天学过的词。但李老师一直鼓励我。她说：「学语言就像种树。你看不到它长，但它每天都在长。」\n\n我照她的建议做了一整年。每天晚上读英语故事，用英语写短日记。慢慢地，我发现自己能懂的越来越多。八年级时，我甚至在一场英语演讲比赛中得了一等奖。\n\n回头看，我意识到最重要的不是你有多少聪明，而是你愿不愿意坚持下去。只要不放弃，每个人都能进步。',
  },
  {
    id: 'cloze-2',
    title: 'The Boy and the Starfish',
    level: '重点',
    topic: 'nature-env',
    intro: '一个关于「一个人的力量是否有意义」的经典故事。',
    passage: [
      'One morning, a man was walking along the beach. The night before, a terrible storm had hit the coast, and thousands of starfish had been ___(1)___ onto the sand.',
      'In the distance, the man saw a boy. The boy was bending down, picking up starfish one by one and throwing them back into the sea. The man walked closer and asked, "Why are you doing this? There are ___(2)___ of starfish on this beach. You cannot possibly make a difference."',
      'The boy looked at the starfish in his hand. Then he threw it into the water and said, "It made a difference to ___(3)___ one."',
      'The man stood there in silence. He had never thought about it that way. He had always believed that small actions were ___(4)___ when the problem was so big.',
      'Then the man bent down, picked up a starfish, and threw it back into the sea. Soon, other people on the beach ___(5)___ them. By the end of the morning, hundreds of starfish had returned to the water.',
      'This story teaches us an important lesson. We often feel that our small efforts cannot change anything. But the truth is, every action ___(6)___, even if we cannot see the result right away.',
      'If you want to protect the environment, you do not have to do something huge. You can start with small things: turn off the lights when you leave a room, use ___(7)___ bags when you go shopping, or pick up the rubbish you see on the ground.',
      'Remember: you may not be able to save all the starfish, but you can always save ___(8)___.',
    ].join('\n\n'),
    blanks: [
      { n: 1, options: ['washed', 'carried', 'blown', 'thrown'], answer: 0,
        why: '风暴把海星「冲」上岸，wash onto the sand 是固定表达；blown 多指被风吹动。' },
      { n: 2, options: ['hundreds', 'thousands', 'millions', 'dozens'], answer: 1,
        why: '前文说 thousands of starfish，这里保持一致；且 hundreds / dozens 与「数不清」的语境不符。' },
      { n: 3, options: ['this', 'that', 'the', 'a'], answer: 0,
        why: '指手里这一只，「对这一只来说有意义」，用 this one。' },
      { n: 4, options: ['useful', 'useless', 'important', 'necessary'], answer: 1,
        why: '与前面「问题这么大」呼应，男人原本认为小行动「没用」。' },
      { n: 5, options: ['joined', 'stopped', 'left', 'watched'], answer: 0,
        why: '后来其他人也「加入」他们，与后文「数百只海星回到海里」呼应。' },
      { n: 6, options: ['works', 'matters', 'happens', 'changes'], answer: 1,
        why: 'every action matters（每个行动都重要）是固定表达，与「小努力也能改变」呼应。' },
      { n: 7, options: ['paper', 'plastic', 'cloth', 'new'], answer: 2,
        why: '环保语境下应使用「布袋」而非塑料袋，cloth bags 符合减少塑料的常识。' },
      { n: 8, options: ['one', 'it', 'them', 'all'], answer: 0,
        why: '呼应前文男孩的话「对这一只有意义」，结尾重复「你总能救这一只」。' },
    ],
    translation: '一天早上，一个男人沿着海滩散步。前一晚，一场可怕的风暴袭击了海岸，成千上万只海星被冲上沙滩。\n\n远处，男人看到一个男孩。男孩正弯下腰，一只一只捡起海星，把它们扔回海里。男人走近问：「你为什么要这样做？这海滩上有成千上万只海星，你不可能改变什么。」\n\n男孩看着手里的海星，然后把它扔进水里说：「对这一只来说，我改变了它的命运。」\n\n男人沉默地站在那里。他从没这样想过。他一直认为，当问题如此之大时，小小的行动是没用的。\n\n然后男人弯下腰，捡起一只海星，扔回海里。很快，海滩上的其他人也加入了他们。到那天早上结束时，数百只海星回到了水里。\n\n这个故事教给我们重要的一课。我们常觉得自己的小小努力改变不了什么。但事实是，每个行动都重要，即使我们无法立刻看到结果。\n\n如果你想保护环境，不必做什么惊天动地的大事。你可以从小事开始：离开房间时关灯，购物时用布袋，或者捡起地上的垃圾。\n\n记住：你也许救不了所有海星，但你总能救这一只。',
  },
];

/* ---------------- 阅读理解 ---------------- */
export const READING = [
  {
    id: 'read-a', level: '基础', type: '应用文', title: 'School Notice Board',
    intro: '北京卷 A 篇通常是这类信息查找题，答案可直接在原文定位。',
    passage: `SCHOOL NOTICE BOARD

【Art Club】
Do you like drawing or painting? Come and join us!
Time: Every Wednesday, 4:00 p.m. – 5:30 p.m.
Place: Art Room, Building B
Teacher: Ms Wang
Note: Please bring your own colour pencils.

【Basketball Club】
Want to stay healthy and make new friends?
Time: Every Friday, 4:30 p.m. – 6:00 p.m.
Place: School playground
Coach: Mr Chen
Note: Wear sports shoes. All students are welcome.

【Reading Club】
Share your favourite books with others!
Time: Every Tuesday, 3:30 p.m. – 4:30 p.m.
Place: School library
Teacher: Ms Liu
Note: You can borrow two books each time.

【Music Club】
Learn to play the guitar or sing in a group!
Time: Every Thursday, 5:00 p.m. – 6:30 p.m.
Place: Music Room, Building A
Teacher: Mr Zhang
Note: The club has only 20 places. Sign up early!`,
    questions: [
      { q: 'If you want to join the Art Club, what should you bring?',
        options: ['Sports shoes.', 'Colour pencils.', 'Some books.', 'A guitar.'], answer: 1,
        why: 'Art Club 的 Note 明确写着 "Please bring your own colour pencils."' },
      { q: 'When does the Basketball Club meet?',
        options: ['Every Tuesday.', 'Every Wednesday.', 'Every Thursday.', 'Every Friday.'], answer: 3,
        why: 'Basketball Club 的 Time 是 "Every Friday, 4:30 p.m. – 6:00 p.m."。' },
      { q: 'Which club needs you to sign up early?',
        options: ['The Art Club.', 'The Basketball Club.', 'The Reading Club.', 'The Music Club.'], answer: 3,
        why: 'Music Club 的 Note 写着 "The club has only 20 places. Sign up early!"，只有它提到名额有限。' },
      { q: 'Where is the Reading Club held?',
        options: ['In the Art Room.', 'On the playground.', 'In the school library.', 'In the Music Room.'], answer: 2,
        why: 'Reading Club 的 Place 是 "School library"。' },
    ],
  },
  {
    id: 'read-b', level: '基础', type: '记叙文', title: 'My First Solo Trip',
    intro: 'B 篇多为记叙文，注意时间线与人物情感变化。',
    passage: `Last summer, I took my first solo trip. I was fifteen, and I had never travelled alone before.

My parents were worried. "Are you sure you can manage?" my mother asked. I told her I could, though deep down I was not so sure.

The trip was from Beijing to Qingdao, a city by the sea. I booked the train ticket myself and packed my bag three times. On the morning of departure, my father drove me to the station. Before I got out of the car, he handed me a small card. "Call us when you arrive," he said.

The train ride took about five hours. At first, I felt nervous. I kept checking my ticket and my bag. But then I started talking to the woman sitting next to me. She was going to Qingdao to visit her daughter. She told me about the best places to eat and the most beautiful beaches. By the time we arrived, I had forgotten to be nervous.

In Qingdao, I stayed in a small hotel near the sea. Every morning I got up early to watch the sunrise. I walked along the beach, ate fresh seafood, and took hundreds of photos. I also got lost twice, but both times kind strangers helped me find my way.

On the last day, I sat on the beach and thought about the trip. I realized that I had learned something important: the world is not as frightening as I had imagined. Most people are kind, and I am braver than I thought.

When I got home, my mother asked, "So, how was it?" I smiled and said, "Can I go again next summer?"`,
    questions: [
      { q: 'How did the writer go to Qingdao?',
        options: ['By plane.', 'By train.', 'By bus.', 'By car.'], answer: 1,
        why: '原文 "I booked the train ticket myself" 和 "The train ride took about five hours" 都说明是坐火车。' },
      { q: 'How did the writer feel at the beginning of the train ride?',
        options: ['Excited.', 'Bored.', 'Nervous.', 'Angry.'], answer: 2,
        why: '原文 "At first, I felt nervous. I kept checking my ticket and my bag."' },
      { q: 'What happened when the writer got lost?',
        options: ['He called his parents.', 'He took a taxi.', 'Strangers helped him.', 'He went back to the hotel.'], answer: 2,
        why: '原文 "I also got lost twice, but both times kind strangers helped me find my way."' },
      { q: 'What did the writer learn from the trip?',
        options: ['Travelling alone is dangerous.', 'The world is not as frightening as imagined.', 'It is hard to find good food.', 'Parents should not worry.'], answer: 1,
        why: '原文最后 "I realized that I had learned something important: the world is not as frightening as I had imagined."' },
    ],
  },
  {
    id: 'read-c', level: '重点', type: '说明文', title: 'Why Do We Need Sleep?',
    intro: 'C 篇多为科普说明文，注意段落主旨与数据细节。',
    passage: `Everyone knows that sleep is important. But do you know why?

Scientists have found that sleep is like a "cleaning time" for our brain. During the day, our brain collects a lot of information. While we sleep, the brain sorts this information and throws away what it does not need. That is why a good sleep can help us remember things better.

Sleep is also important for our body. When we are asleep, our body repairs itself. Growth hormone (生长激素) is released mostly during deep sleep. This is why children who do not get enough sleep may grow more slowly.

How much sleep do we need? Doctors say that teenagers should sleep about nine hours a night. However, a recent survey in Beijing found that many middle school students sleep only about seven hours. The main reasons are too much homework and late use of mobile phones.

Lack of sleep can cause serious problems. Students who sleep less may find it hard to focus in class. They may also get angry more easily and catch colds more often.

So what can we do? First, try to go to bed and get up at the same time every day. Second, keep your phone out of your bedroom. Third, do not drink coffee or tea in the evening.

Sleep is not a waste of time. It is the time when our brain and body get ready for a new day.`,
    questions: [
      { q: 'According to the passage, what does the brain do while we sleep?',
        options: ['It stops working.', 'It collects new information.', 'It sorts information and throws away useless parts.', 'It grows bigger.'], answer: 2,
        why: '第二段 "While we sleep, the brain sorts this information and throws away what it does not need."' },
      { q: 'Why may children who sleep too little grow more slowly?',
        options: ['They eat less food.', 'Growth hormone is released mostly during deep sleep.', 'They exercise less.', 'They are often ill.'], answer: 1,
        why: '第三段 "Growth hormone is released mostly during deep sleep. This is why children who do not get enough sleep may grow more slowly."' },
      { q: 'How many hours of sleep do doctors say teenagers need?',
        options: ['About seven.', 'About eight.', 'About nine.', 'About ten.'], answer: 2,
        why: '第四段 "Doctors say that teenagers should sleep about nine hours a night."' },
      { q: 'What is the passage mainly about?',
        options: ['How to do homework faster.', 'Why sleep matters and how to sleep better.', 'Why students use phones too much.', 'How the brain grows.'], answer: 1,
        why: '全文从「睡眠的作用」讲到「需要多少」再到「如何改善」，主旨是睡眠的重要性与改善方法。' },
    ],
  },
  {
    id: 'read-d', level: '难点', type: '议论文', title: 'Should Students Have Part-time Jobs?',
    intro: 'D 篇多为议论文或观点类文章，注意区分作者观点与不同立场。',
    passage: `These days, more and more middle school students in Beijing are taking part-time jobs during the summer holiday. Some people think this is a great idea, while others are worried.

Those who support part-time jobs say that working teaches students things that school cannot. For example, a student who works in a restaurant learns how to communicate with customers and how to work in a team. They also learn the value of money. "Before I got my first job, I never knew how hard my parents worked," says Li Ming, a 15-year-old student. "Now I think twice before I spend money."

Supporters also point out that part-time jobs can help students find out what they are good at. A student who enjoys working with children, for example, might decide to become a teacher.

However, some parents and teachers are against the idea. They worry that work will take up too much time and affect students' studies. "Students already have a lot of homework," says one teacher. "Their main job should be learning."

Others are concerned about safety. Some jobs, such as delivering food, can be dangerous for young people. They believe that students should only take safe and simple jobs.

In my opinion, part-time jobs can be good, but only if students choose carefully. A student should not work more than a few hours a day, and the job must be safe. If these conditions are met, working can be a valuable lesson that no textbook can teach.`,
    questions: [
      { q: 'What do supporters think students can learn from part-time jobs?',
        options: ['How to cook at home.', 'How to communicate and work in a team.', 'How to pass exams.', 'How to make friends online.'], answer: 1,
        why: '第二段 "a student who works in a restaurant learns how to communicate with customers and how to work in a team."' },
      { q: 'Why are some parents against part-time jobs?',
        options: ['They think the pay is too low.', 'They worry work will affect studies.', 'They think students are too young to work.', 'They do not like restaurants.'], answer: 1,
        why: '第四段 "They worry that work will take up too much time and affect students\' studies."' },
      { q: 'What is the writer\'s own opinion?',
        options: ['Students should never work.', 'All students should work full-time.', 'Part-time jobs are good if chosen carefully.', 'Only restaurant jobs are suitable.'], answer: 2,
        why: '最后一段 "In my opinion, part-time jobs can be good, but only if students choose carefully."' },
      { q: 'The underlined word "valuable" in the last paragraph probably means ___.',
        options: ['expensive', 'useful', 'difficult', 'dangerous'], answer: 1,
        why: 'a valuable lesson that no textbook can teach 指「课本教不了的宝贵/有用的一课」，valuable 在此意为 useful。' },
      { q: 'What is the best title for the passage?',
        options: ['How to Find a Part-time Job', 'Students and Part-time Jobs', 'The Dangers of Working', 'Why Parents Work Hard'], answer: 1,
        why: '全文围绕「中学生该不该做兼职」的正反观点展开，B 项最贴合主旨。' },
    ],
  },
];
