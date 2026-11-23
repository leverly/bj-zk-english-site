"""Build the Beijing zhongkao vocabulary dataset from ECDICT's `zk` tag.

Source : reference/ecdict.csv  (ECDICT, tag contains "zk" = 中考大纲词)
Output : src/data-words.js     (window.ZK_DATA.WORDS / THEMES / STATS)

Design notes
------------
* 词表底座取 ECDICT 中带 `zk` 标签的词条（1603 条），这是公开词典里最接近
  义务教育英语课程标准（2022 年版）三级词汇表的可复现来源。
* 释义沿用 PET 项目验证过的清洗策略：按词性优先取义、剔除领域标注
  （[计]/[化]…）、过滤生僻第二义，并对高频多义词走人工覆盖表。
* 分档不再用「大纲词=核心」这种无区分度的口径，改用 COCA/BNC 语料词频：
    core  frq <= 1000     卷面高频，必须脱口而出
    mid   1000 < frq <= 5000  阅读与写作的主力
    ext   其余
* 主题归类按新课标「三大主题语境」的语义场做关键词规则匹配，未命中归「通用」。
  这是启发式归类，页面会注明「按词义规则参考归类」。
"""
import csv, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
csv.field_size_limit(10 ** 9)

# ---------------------------------------------------------------- 多义词人工覆盖
OVERRIDE = {
    'a': '一个（不定冠词）', 'an': '一个（不定冠词）', 'the': '这；那（定冠词）',
    'be': '是；存在；成为', 'am': '是（be 的第一人称单数）', 'is': '是（be 的第三人称单数）',
    'are': '是（be 的复数）', 'was': '是（be 的过去式单数）', 'were': '是（be 的过去式复数）',
    'go': '去；走；进行', 'take': '拿；带走；花费；乘坐', 'get': '得到；变得；到达',
    'make': '制作；使得；做出', 'have': '有；吃；进行', 'do': '做；干',
    'well': '好地；健康的', 'good': '好的；擅长的', 'like': '喜欢；像',
    'back': '后面；回来；背部', 'run': '跑；经营；运行', 'set': '放置；设置；一套',
    'turn': '转动；变成；轮流', 'put': '放；放置', 'come': '来；到达；出现',
    'give': '给；提供', 'look': '看；看起来', 'find': '找到；发现；认为',
    'keep': '保持；保存；继续', 'leave': '离开；留下；休假', 'mean': '意思是；意味着',
    'call': '打电话；称呼；喊', 'play': '玩；演奏；戏剧', 'work': '工作；起作用；作品',
    'mind': '介意；头脑；注意', 'matter': '事情；要紧；物质', 'point': '点；观点；指向',
    'place': '地方；放置；名次', 'kind': '种类；友善的', 'right': '正确的；右边；权利',
    'left': '左边；剩下的', 'light': '光；轻的；点燃', 'free': '自由的；免费的；空闲的',
    'hard': '困难的；努力地；硬的', 'last': '最后的；持续', 'just': '刚刚；只是；公正的',
    'still': '仍然；静止的', 'even': '甚至；平坦的', 'own': '自己的；拥有',
    'same': '相同的', 'such': '这样的；如此的', 'few': '很少的；几个',
    'little': '小的；很少', 'much': '许多；非常', 'many': '许多',
    'one': '一；一个', 'two': '二', 'first': '第一；首先', 'second': '第二；秒',
    'third': '第三', 'time': '时间；次数', 'way': '方法；路', 'life': '生活；生命',
    'world': '世界', 'home': '家；在家', 'school': '学校', 'family': '家庭',
    'friend': '朋友', 'people': '人；人们', 'man': '男人；人类', 'woman': '女人',
    'child': '孩子', 'children': '孩子们', 'parent': '父亲（或母亲）',
    'student': '学生', 'teacher': '教师', 'class': '班级；课', 'lesson': '课；教训',
    'book': '书；预订', 'word': '单词；话语', 'name': '名字；命名',
    'day': '天；白天', 'year': '年', 'month': '月', 'week': '周；星期',
    'morning': '早晨；上午', 'afternoon': '下午', 'evening': '傍晚；晚上', 'night': '夜晚',
    'today': '今天', 'tomorrow': '明天', 'yesterday': '昨天',
    'eat': '吃', 'drink': '喝；饮料', 'sleep': '睡觉；睡眠', 'live': '居住；生活',
    'help': '帮助', 'need': '需要', 'want': '想要', 'hope': '希望', 'wish': '希望；祝愿',
    'think': '想；认为', 'know': '知道；认识', 'learn': '学习；得知', 'study': '学习；研究',
    'read': '读；阅读', 'write': '写；写作', 'speak': '说；讲（语言）', 'say': '说',
    'tell': '告诉；讲述', 'talk': '谈话；交谈', 'listen': '听', 'hear': '听见；听说',
    'watch': '观看；手表', 'see': '看见；明白', 'meet': '遇见；满足', 'visit': '参观；拜访',
    'buy': '买', 'sell': '卖', 'pay': '支付；工资', 'cost': '花费；成本',
    'spend': '花费（时间/金钱）', 'open': '打开；开放的', 'close': '关闭；亲密的',
    'start': '开始；出发', 'begin': '开始', 'finish': '完成；结束', 'stop': '停止；车站',
    'keep': '保持；保存；继续', 'bring': '带来', 'carry': '携带；搬运',
    'send': '发送；寄', 'receive': '收到；接待', 'answer': '回答；答案',
    'ask': '问；请求', 'borrow': '借入', 'lend': '借出', 'return': '返回；归还',
    'wear': '穿；戴', 'dress': '穿衣；连衣裙', 'put on': '穿上；上演',
    'grow': '生长；种植', 'plant': '种植；植物', 'feed': '喂养', 'raise': '举起；抚养；筹集',
    'build': '建造', 'break': '打破；休息', 'fix': '修理；固定', 'repair': '修理',
    'clean': '打扫；干净的', 'wash': '洗', 'cook': '烹饪；厨师', 'cut': '切；剪',
    'draw': '画；拉', 'paint': '绘画；油漆', 'sing': '唱歌', 'dance': '跳舞',
    'swim': '游泳', 'jump': '跳', 'climb': '攀登', 'ride': '骑；乘',
    'drive': '驾驶', 'fly': '飞；苍蝇', 'travel': '旅行', 'arrive': '到达',
    'leave': '离开；留下', 'move': '移动；搬家', 'stay': '停留；保持',
    'wait': '等待', 'happen': '发生', 'appear': '出现；似乎', 'seem': '似乎',
    'become': '变成；成为', 'feel': '感觉；触摸', 'sound': '听起来；声音',
    'smell': '闻起来；气味', 'taste': '尝起来；味道', 'look like': '看起来像',
    'agree': '同意', 'disagree': '不同意', 'decide': '决定', 'choose': '选择',
    'try': '尝试；努力', 'practise': '练习', 'practice': '练习；实践',
    'enjoy': '享受；喜爱', 'hate': '讨厌', 'love': '爱；喜爱', 'prefer': '更喜欢',
    'worry': '担心', 'smile': '微笑', 'laugh': '笑', 'cry': '哭；喊叫',
    'shout': '喊叫', 'throw': '扔；投', 'catch': '抓住；赶上', 'hold': '握住；举行',
    'lift': '举起；电梯', 'pull': '拉', 'push': '推', 'drop': '掉落；水滴',
    'fall': '落下；秋天', 'rise': '上升；升起', 'save': '拯救；节省',
    'kill': '杀死', 'die': '死', 'dead': '死的', 'death': '死亡',
    'wake': '醒来；唤醒', 'forget': '忘记', 'remember': '记得', 'remind': '提醒',
    'understand': '理解', 'explain': '解释', 'describe': '描述', 'discuss': '讨论',
    'introduce': '介绍', 'invite': '邀请', 'thank': '感谢', 'welcome': '欢迎',
    'hope': '希望', 'expect': '期待；预料', 'promise': '承诺', 'allow': '允许',
    'let': '让；允许', 'make': '制作；使得', 'have to': '不得不', 'used to': '过去常常',
    'would like': '想要', 'look forward to': '期待', 'take care of': '照顾',
    'give up': '放弃', 'put off': '推迟', 'turn on': '打开', 'turn off': '关掉',
    'turn up': '调高；出现', 'turn down': '调低；拒绝', 'look after': '照顾',
    'look up': '查阅；抬头看', 'look for': '寻找', 'come true': '实现',
    'take part in': '参加', 'join': '加入', 'join in': '参加',
    'be good at': '擅长', 'be interested in': '对…感兴趣', 'be afraid of': '害怕',
    'be proud of': '为…骄傲', 'be full of': '充满', 'be different from': '与…不同',
    'be similar to': '与…相似', 'be famous for': '因…而闻名', 'be busy with': '忙于',
    'depend on': '依靠；取决于', 'belong to': '属于', 'pay attention to': '注意',
    'make friends': '交朋友', 'make a decision': '做决定', 'make progress': '取得进步',
    'in order to': '为了', 'as soon as': '一…就…', 'as long as': '只要',
    'so that': '以便；结果', 'even though': '即使', 'instead of': '代替；而不是',
    'because of': '因为', 'according to': '根据', 'thanks to': '多亏；由于',
    'such as': '例如', 'for example': '例如', 'at least': '至少', 'at first': '起初',
    'at last': '最后', 'in fact': '事实上', 'in the end': '最后', 'on time': '准时',
    'in time': '及时', 'right away': '立刻', 'as usual': '像往常一样',
    'by accident': '偶然', 'by mistake': '错误地', 'in a hurry': '匆忙',
    'from time to time': '不时', 'once upon a time': '从前', 'all the time': '一直',
    'a lot of': '许多', 'lots of': '许多', 'plenty of': '大量', 'a number of': '许多',
    'the number of': '…的数量', 'too much': '太多（不可数）', 'too many': '太多（可数）',
    'much too': '太（+形容词）', 'a bit': '一点儿', 'a little': '一点儿（不可数）',
    'a few': '几个（可数）', 'no longer': '不再', 'not any more': '不再',
    'would rather': '宁愿', 'had better': '最好', 'may be': '可能是', 'maybe': '也许',
}

# 高频功能词与不规则词的词性人工指定。
# WordNet 释义对这类词常给出错误的「主词性」（the 会被投成动词，three 被投成名词），
# 而它们恰恰是单选与语法填空的考点，词性错了整个词表页就是错的。
POS_OVERRIDE = {
    'a': 'det', 'an': 'det', 'the': 'det', 'no': 'det',
    'be': 'v', 'am': 'v', 'is': 'v', 'are': 'v', 'was': 'v', 'were': 'v',
    'go': 'v', 'take': 'v', 'get': 'v', 'make': 'v', 'have': 'v', 'do': 'v',
    'come': 'v', 'give': 'v', 'look': 'v', 'find': 'v', 'keep': 'v',
    'leave': 'v', 'mean': 'v', 'call': 'v', 'play': 'v', 'work': 'v',
    'mind': 'v', 'matter': 'v', 'point': 'v', 'place': 'v', 'turn': 'v',
    'put': 'v', 'set': 'v', 'run': 'v', 'eat': 'v', 'drink': 'v',
    'sleep': 'v', 'live': 'v', 'help': 'v', 'need': 'v', 'want': 'v',
    'hope': 'v', 'wish': 'v', 'think': 'v', 'know': 'v', 'learn': 'v',
    'study': 'v', 'read': 'v', 'write': 'v', 'speak': 'v', 'say': 'v',
    'tell': 'v', 'talk': 'v', 'listen': 'v', 'hear': 'v', 'watch': 'v',
    'see': 'v', 'meet': 'v', 'visit': 'v', 'buy': 'v', 'sell': 'v',
    'pay': 'v', 'cost': 'v', 'spend': 'v', 'open': 'v', 'close': 'v',
    'start': 'v', 'begin': 'v', 'finish': 'v', 'stop': 'v', 'bring': 'v',
    'carry': 'v', 'send': 'v', 'receive': 'v', 'answer': 'v', 'ask': 'v',
    'borrow': 'v', 'lend': 'v', 'return': 'v', 'wear': 'v', 'dress': 'v',
    'grow': 'v', 'plant': 'v', 'feed': 'v', 'raise': 'v', 'build': 'v',
    'break': 'v', 'fix': 'v', 'repair': 'v', 'clean': 'v', 'wash': 'v',
    'cook': 'v', 'cut': 'v', 'draw': 'v', 'paint': 'v', 'sing': 'v',
    'dance': 'v', 'swim': 'v', 'jump': 'v', 'climb': 'v', 'ride': 'v',
    'drive': 'v', 'fly': 'v', 'travel': 'v', 'arrive': 'v', 'move': 'v',
    'stay': 'v', 'wait': 'v', 'happen': 'v', 'appear': 'v', 'seem': 'v',
    'become': 'v', 'feel': 'v', 'sound': 'v', 'smell': 'v', 'taste': 'v',
    'agree': 'v', 'disagree': 'v', 'decide': 'v', 'choose': 'v', 'try': 'v',
    'practise': 'v', 'practice': 'v', 'enjoy': 'v', 'hate': 'v', 'love': 'v',
    'prefer': 'v', 'worry': 'v', 'smile': 'v', 'laugh': 'v', 'cry': 'v',
    'shout': 'v', 'throw': 'v', 'catch': 'v', 'hold': 'v', 'lift': 'v',
    'pull': 'v', 'push': 'v', 'drop': 'v', 'fall': 'v', 'rise': 'v',
    'save': 'v', 'kill': 'v', 'die': 'v', 'wake': 'v', 'forget': 'v',
    'remember': 'v', 'remind': 'v', 'understand': 'v', 'explain': 'v',
    'describe': 'v', 'discuss': 'v', 'introduce': 'v', 'invite': 'v',
    'thank': 'v', 'welcome': 'v', 'expect': 'v', 'promise': 'v',
    'allow': 'v', 'let': 'v', 'join': 'v', 'build': 'v',
    'one': 'num', 'two': 'num', 'three': 'num', 'four': 'num',
    'five': 'num', 'six': 'num', 'seven': 'num', 'eight': 'num',
    'nine': 'num', 'ten': 'num', 'first': 'num', 'second': 'num',
    'third': 'num', 'hundred': 'num', 'thousand': 'num', 'million': 'num',
    'i': 'pron', 'you': 'pron', 'he': 'pron', 'she': 'pron', 'it': 'pron',
    'we': 'pron', 'they': 'pron', 'me': 'pron', 'him': 'pron', 'her': 'pron',
    'us': 'pron', 'them': 'pron', 'my': 'pron', 'your': 'pron',
    'his': 'pron', 'their': 'pron', 'our': 'pron', 'its': 'pron',
    'this': 'pron', 'that': 'pron', 'these': 'pron', 'those': 'pron',
    'who': 'pron', 'whom': 'pron', 'whose': 'pron', 'which': 'pron',
    'what': 'pron', 'something': 'pron', 'anything': 'pron',
    'nothing': 'pron', 'everything': 'pron', 'someone': 'pron',
    'anyone': 'pron', 'everyone': 'pron', 'nobody': 'pron',
    'and': 'conj', 'but': 'conj', 'or': 'conj', 'so': 'conj',
    'because': 'conj', 'if': 'conj', 'while': 'conj', 'though': 'conj',
    'although': 'conj', 'unless': 'conj', 'since': 'conj', 'as': 'conj',
    'than': 'conj',
    'well': 'adv', 'very': 'adv', 'too': 'adv', 'also': 'adv',
    'always': 'adv', 'often': 'adv', 'never': 'adv', 'usually': 'adv',
    'sometimes': 'adv', 'just': 'adv', 'still': 'adv', 'even': 'adv',
    'already': 'adv', 'yet': 'adv', 'again': 'adv', 'soon': 'adv',
    'here': 'adv', 'there': 'adv', 'now': 'adv', 'then': 'adv',
    'up': 'adv', 'down': 'adv', 'out': 'adv', 'back': 'adv', 'not': 'adv',
    'in': 'prep', 'on': 'prep', 'at': 'prep', 'to': 'prep', 'for': 'prep',
    'from': 'prep', 'with': 'prep', 'by': 'prep', 'about': 'prep',
    'of': 'prep', 'into': 'prep', 'over': 'prep', 'under': 'prep',
    'between': 'prep', 'among': 'prep', 'during': 'prep', 'before': 'prep',
    'after': 'prep', 'above': 'prep', 'below': 'prep', 'across': 'prep',
    'through': 'prep', 'against': 'prep', 'without': 'prep', 'around': 'prep',
    'like': 'prep',
    'good': 'adj', 'bad': 'adj', 'big': 'adj', 'small': 'adj',
    'great': 'adj', 'little': 'adj', 'long': 'adj', 'short': 'adj',
    'high': 'adj', 'low': 'adj', 'old': 'adj', 'young': 'adj',
    'new': 'adj', 'right': 'adj', 'left': 'adj', 'same': 'adj',
    'different': 'adj', 'hard': 'adj', 'easy': 'adj', 'free': 'adj',
    'kind': 'adj', 'light': 'adj', 'last': 'adj', 'own': 'adj',
    'such': 'adj', 'few': 'adj', 'many': 'adj', 'much': 'adj',
    'some': 'adj', 'any': 'adj', 'all': 'adj', 'both': 'adj',
    'each': 'adj', 'every': 'adj', 'other': 'adj', 'another': 'adj',
    'more': 'adj', 'most': 'adj', 'yes': 'int', 'wow': 'int',
}

# ---------------------------------------------------------------- 主题语境（新课标三大主题语境）
# 关键词规则：命中即归入该主题群；一个词可命中多个主题。
THEME_RULES = [
    ('self-life', [
        'family', 'parent', 'mother', 'father', 'sister', 'brother', 'grand',
        'home', 'house', 'room', 'bed', 'kitchen', 'bath', 'door', 'window',
        'eat', 'food', 'meal', 'breakfast', 'lunch', 'dinner', 'rice', 'bread',
        'fruit', 'apple', 'banana', 'orange', 'vegetable', 'meat', 'egg', 'milk',
        'water', 'tea', 'coffee', 'juice', 'cook', 'hungry', 'thirsty',
        'sleep', 'wake', 'tired', 'rest', 'clothes', 'wear', 'dress', 'shirt',
        'coat', 'shoe', 'hat', 'wash', 'clean', 'brush', 'habit', 'daily',
        'morning', 'evening', 'night', 'early', 'late', 'clock', 'time',
        'hobby', 'like', 'enjoy', 'interest', 'free', 'weekend', 'holiday',
        'health', 'healthy', 'ill', 'sick', 'doctor', 'hospital', 'medicine',
        'head', 'hand', 'foot', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'face',
        'body', 'heart', 'hurt', 'pain', 'feel', 'happy', 'sad', 'angry',
        'afraid', 'worried', 'glad', 'excited', 'nervous', 'proud', 'lonely',
        'kind', 'honest', 'brave', 'polite', 'careful', 'patient', 'friendly',
        'help', 'share', 'care', 'respect', 'confident',
        # 中文语义场补充
        '家', '父', '母', '兄', '姐', '弟', '妹', '爷', '奶', '亲', '房', '屋',
        '吃', '饭', '食', '餐', '喝', '饮料', '睡', '醒', '累', '衣', '穿', '洗',
        '健康', '病', '医生', '医院', '药', '头', '手', '脚', '眼', '耳', '嘴',
        '牙', '脸', '身体', '心', '疼', '痛', '感觉', '高兴', '快乐', '悲', '伤',
        '生气', '害怕', '担心', '兴', '激', '紧', '骄', '孤', '诚', '勇', '礼',
        '细', '耐', '友', '帮', '分享', '照顾', '尊重', '自信', '习', '惯', '早',
        '晚', '假', '周末', '闲',
    ]),
    ('self-study', [
        'school', 'class', 'lesson', 'study', 'learn', 'teach', 'teacher',
        'student', 'pupil', 'book', 'read', 'write', 'homework', 'exam', 'test',
        'grade', 'score', 'subject', 'english', 'chinese', 'math', 'science',
        'history', 'geography', 'art', 'music', 'computer',
        'library', 'desk', 'blackboard', 'pen', 'pencil', 'paper', 'note',
        'question', 'answer', 'problem', 'difficult', 'easy', 'hard', 'know',
        'understand', 'remember', 'forget', 'practise', 'practice', 'mistake',
        'progress', 'improve', 'goal', 'plan', 'attention', 'focus',
        'knowledge', 'skill', 'ability', 'effort', 'try', 'success', 'fail',
        'college', 'university', 'future', 'dream', 'hope', 'wish', 'choose',
        'education', 'train', 'course', 'degree', 'talent',
        # 中文
        '学', '教', '课', '书', '读', '写', '作业', '考试', '成绩', '分', '科目',
        '语', '数', '科', '史', '地理', '美术', '音', '图书', '笔', '纸', '题',
        '难', '易', '懂', '记', '练', '错', '进步', '提高', '目标', '计划', '注意',
        '知识', '技', '能力', '努力', '成功', '失败', '大学', '未来', '梦想',
        '希望', '选择', '教育', '培训', '课程', '才',
    ]),
    ('society-people', [
        'friend', 'people', 'person', 'man', 'woman', 'boy', 'girl', 'child',
        'neighbour', 'neighbor', 'stranger', 'guest', 'team', 'group', 'member',
        'meet', 'talk', 'speak', 'say', 'tell', 'ask', 'answer', 'greet',
        'hello', 'thanks', 'sorry', 'please', 'welcome', 'invite', 'visit',
        'help', 'together', 'share',
        'letter', 'email', 'message', 'phone', 'call', 'chat', 'communicate',
        'understand', 'agree', 'disagree', 'argue', 'promise', 'trust',
        'respect', 'polite', 'manner', 'relationship', 'communicate',
        # 中文
        '朋', '人', '男', '女', '孩', '邻', '陌生', '客', '队', '组', '成员',
        '见', '谈', '说', '讲', '告', '问', '答', '问候', '谢', '歉', '请',
        '欢迎', '邀请', '拜访', '一起', '分享', '信', '邮件', '消息', '电话',
        '聊', '交流', '理解', '同意', '争论', '承诺', '信任', '尊', '礼',
        '关系', '沟通', '交',
    ]),
    ('society-culture', [
        'festival', 'spring', 'autumn', 'christmas', 'holiday',
        'tradition', 'culture', 'custom', 'history', 'ancient', 'modern',
        'song', 'dance', 'film', 'movie', 'theatre', 'museum',
        'sport', 'game', 'match', 'ball', 'football', 'basketball',
        'swim', 'race', 'win', 'lose', 'player', 'coach',
        'story', 'novel', 'poem', 'writer', 'artist', 'paint', 'draw',
        'country', 'city', 'town', 'village', 'capital', 'travel',
        'trip', 'tour', 'sight', 'dish', 'perform', 'concert', 'show',
        # 中文
        '节', '传统', '文化', '习俗', '历史', '古', '现代', '歌', '舞', '电影',
        '剧', '博物', '运动', '比赛', '球', '足球', '篮球', '游泳', '跑', '赛',
        '赢', '输', '队员', '教练', '故事', '小说', '诗', '作家', '艺术', '画',
        '国', '城', '镇', '村', '首都', '旅行', '旅游', '景', '菜', '表演',
        '音乐', '演', '展览', '节日',
    ]),
    ('society-tech', [
        'science', 'technology', 'computer', 'internet', 'online', 'website',
        'phone', 'mobile', 'email', 'message', 'robot', 'machine', 'invent',
        'invention', 'discover', 'research', 'experiment', 'data', 'digital',
        'screen', 'video', 'photo', 'camera', 'electric', 'energy', 'device',
        'tool', 'engine', 'program', 'software', 'network', 'signal',
        # 中文
        '科', '技术', '电脑', '计算机', '网络', '网', '网站', '手机', '邮件',
        '机器人', '机器', '发明', '发现', '研究', '实验', '数据', '数字', '屏',
        '视频', '照片', '相机', '电', '能源', '设备', '工具', '引擎', '程序',
        '软件', '信号', '智能',
    ]),
    ('nature-life', [
        'animal', 'plant', 'tree', 'flower', 'grass', 'forest', 'river', 'lake',
        'sea', 'ocean', 'mountain', 'hill', 'sky', 'sun', 'moon', 'star',
        'cloud', 'rain', 'snow', 'wind', 'weather', 'season',
        'summer', 'winter', 'hot', 'cold', 'warm', 'cool', 'wet',
        'bird', 'fish', 'dog', 'cat', 'horse', 'sheep', 'cow', 'pig', 'duck',
        'insect', 'butterfly', 'bee', 'grow', 'feed', 'wild', 'nature', 'garden',
        'farm', 'field', 'stone', 'sand', 'island', 'beach',
        # 中文
        '动物', '植物', '树', '花', '草', '森林', '河', '湖', '海', '洋', '山',
        '天', '太阳', '月', '星', '云', '雨', '雪', '风', '天气', '季', '夏',
        '冬', '热', '冷', '暖', '凉', '湿', '鸟', '鱼', '狗', '猫', '马', '羊',
        '牛', '猪', '鸭', '虫', '蝴蝶', '蜂', '生长', '喂养', '野', '自然',
        '园', '农', '田', '石', '沙', '岛', '沙滩', '风景',
    ]),
    ('nature-env', [
        'environment', 'pollution', 'pollute', 'waste', 'rubbish', 'garbage',
        'recycle', 'protect', 'energy', 'resource', 'earth', 'air',
        'plastic', 'climate', 'damage', 'harm', 'reduce', 'reuse',
        'save', 'green', 'clean', 'dirty', 'noise',
        # 中文
        '环境', '污染', '垃圾', '废', '回收', '保护', '资源', '地球', '空气',
        '塑料', '气候', '损害', '害', '减少', '节约', '绿', '干净', '脏',
        '噪音', '低碳', '环保', '排放',
    ]),
    ('nature-disaster', [
        'danger', 'dangerous', 'safe', 'safety', 'accident', 'flood', 'fire',
        'earthquake', 'storm', 'disaster', 'emergency', 'warn',
        'rescue', 'hurt', 'destroy', 'risk', 'escape', 'rule',
        # 中文
        '危险', '安全', '事故', '洪', '火', '地震', '风暴', '灾', '紧急',
        '警告', '救援', '伤害', '毁', '风险', '逃', '规则',
    ]),
    ('nature-space', [
        'space', 'universe', 'planet', 'earth', 'astronaut', 'rocket',
        'satellite', 'explore', 'galaxy', 'orbit',
        # 中文
        '太空', '宇宙', '行星', '地球', '宇航', '火箭', '卫星', '探索',
        '星系', '轨道', '航天',
    ]),
]

THEMES = [
    {'id': 'self-life', 'name': '人与自我 · 生活与学习', 'group': '人与自我',
     'icon': '🏠', 'desc': '家庭、饮食起居、健康身心与生活习惯——中考听力与写作最常出现的场景。'},
    {'id': 'self-study', 'name': '人与自我 · 学习与成长', 'group': '人与自我',
     'icon': '📚', 'desc': '校园、课堂、学习方法、目标与梦想，写作题的常见话题来源。'},
    {'id': 'society-people', 'name': '人与社会 · 人际沟通', 'group': '人与社会',
     'icon': '🤝', 'desc': '朋友、家人、师生之间的交往与沟通，情景交际题的语料库。'},
    {'id': 'society-culture', 'name': '人与社会 · 文化与体育', 'group': '人与社会',
     'icon': '🎭', 'desc': '节日、传统、文学艺术与体育运动，阅读理解的高频题材。'},
    {'id': 'society-tech', 'name': '人与社会 · 科学与技术', 'group': '人与社会',
     'icon': '💡', 'desc': '科技、发明与互联网，近年阅读与完形的新兴热点。'},
    {'id': 'nature-life', 'name': '人与自然 · 自然生态', 'group': '人与自然',
     'icon': '🌿', 'desc': '动植物、天气季节与自然景观，看图与描述类题目的基础词。'},
    {'id': 'nature-env', 'name': '人与自然 · 环境保护', 'group': '人与自然',
     'icon': '♻️', 'desc': '污染、垃圾、节能与低碳生活，写作与阅读的常见主题。'},
    {'id': 'nature-disaster', 'name': '人与自然 · 安全与防灾', 'group': '人与自然',
     'icon': '🛡️', 'desc': '安全、事故与灾害防范，实用类阅读的高频词。'},
    {'id': 'nature-space', 'name': '人与自然 · 宇宙探索', 'group': '人与自然',
     'icon': '🚀', 'desc': '太空、星球与航天，科普类阅读的专有语料。'},
    {'id': 'general', 'name': '通用高频', 'group': '跨主题',
     'icon': '🔤', 'desc': '功能词与跨场景通用词（冠词、介词、连词、代词等），不归属单一主题。'},
]

POS_ZH = {
    'n': '名词', 'v': '动词', 'adj': '形容词',
    'adv': '副词', 'prep': '介词', 'conj': '连词', 'pron': '代词', 'det': '限定词',
    'num': '数词', 'int': '感叹词', 'aux': '助动词',
}

# ECDICT 的细词性 → 本项目规范词性
POS_NORM = {
    'n': 'n', 'pl': 'n', 'v': 'v', 'vt': 'v', 'vi': 'v', 'aux': 'aux',
    'a': 'adj', 'adj': 'adj', 'adv': 'adv', 'ad': 'adv',
    'prep': 'prep', 'conj': 'conj', 'pron': 'pron',
    'art': 'det', 'det': 'det', 'num': 'num',
    'interj': 'int', 'int': 'int',
}

DOMAIN_NOISE = re.compile(r'\[(计|化|医|经|机|电|网络|物|数|生|法|军|农|冶|纺|体)\]')
BAD_SENSE = {
    '打桩锤', '坏蛋', '鱼群', '门派', '粗粉', '打赌', '保释金', '种马', '总线',
    '累加器', '加法器', '遗传', '组氨酸', '迈尔', '信息论', '输入端', '作废字符',
    '地址转换器', '异常传输', '自动订票', '胡德', '引擎盖', '腓肠', '袍', '雉',
    '山鹑', '獾', '猪圈', '熊抱', '橡胶树', '马戏场', '虚无', '梯级', '绦虫',
}
POS_ORDER = ['n', 'v', 'adj', 'adv', 'prep', 'conj', 'pron', 'det', 'num', 'int']
POS_EQ = {'n': {'n'}, 'v': {'v', 'vt', 'vi', 'aux'}, 'adj': {'a', 'adj'},
          'adv': {'adv', 'ad'}, 'prep': {'prep'}, 'conj': {'conj'},
          'pron': {'pron'}, 'det': {'art', 'det'}, 'num': {'num'}, 'int': {'int'}}


def parse_senses(tr):
    """ECDICT translation -> [(pos, [sense...])]. `pos` is '' when the line has no prefix."""
    if not tr:
        return []
    tr = tr.replace('\\n', '\n').replace('\r', '')
    out = []
    for line in tr.split('\n'):
        line = line.strip()
        if not line or line.startswith('['):
            continue
        if DOMAIN_NOISE.search(line):
            line = DOMAIN_NOISE.sub('', line).strip()
            if not line:
                continue
        m = re.match(r'^([a-z]{1,6})\.\s*(.+)$', line)
        pos, body = ('', line)
        if m:
            pos, body = m.group(1), m.group(2)
        senses = []
        for p in re.split(r'[；;，,]', body):
            p = p.strip().strip('。.')
            p = re.sub(r'\(.*?\)|（.*?）', '', p).strip()
            if p and len(p) <= 18 and p not in BAD_SENSE:
                senses.append(p)
        if senses:
            out.append((pos, senses))
    return out


# WordNet 词性缩写（ECDICT definition 字段）→ 本项目的规范词性
DEF_POS = {'n': 'n', 'v': 'v', 'a': 'adj', 's': 'adj', 'r': 'adv',
           'j': 'adj', 'p': 'prep', 'c': 'conj', 'm': 'num', 'u': 'aux'}


def pos_from_definition(defi):
    """按出现频次从 WordNet definition 里投票选出主词性（最可靠的词性来源）。

    注意：ECDICT 的 definition 用字面 `\\n` 分隔义项，必须先还原成真换行，
    否则行首词性标记匹配不到（这正是词性全被兜底成名词的原因）。
    """
    if not defi:
        return ''
    defi = defi.replace('\\n', '\n').replace('\r', '')
    counts = {}
    for m in re.finditer(r'(?:^|\n)\s*([a-z])\.\s', defi):
        p = DEF_POS.get(m.group(1))
        if p:
            counts[p] = counts.get(p, 0) + 1
    if not counts:
        return ''
    return max(counts.items(), key=lambda kv: kv[1])[0]


def pick_gloss(tr, limit=2):
    groups = parse_senses(tr)
    if not groups:
        return '', ''
    flat, gloss = [], []
    for pos, senses in groups:
        for s in senses:
            if s in flat:
                continue
            flat.append(s)
            if len(gloss) < limit:
                gloss.append(s)
        if len(gloss) >= limit:
            break
    # 释义行自带的词性前缀同样可用，作为第二优先来源
    main_pos = groups[0][0] if groups[0][0] in POS_ZH else ''
    return '；'.join(gloss), main_pos


def _int(v):
    try:
        return int(v or 0)
    except (TypeError, ValueError):
        return 0


def band(row):
    """按语料词频分档（越小越常见）。"""
    frq, bnc = _int(row.get('frq')), _int(row.get('bnc'))
    score = min([x for x in (frq, bnc) if x] or [0])
    if not score:
        return 'ext'
    if score <= 1000:
        return 'core'
    if score <= 5000:
        return 'mid'
    return 'ext'


def assign_themes(word, gloss):
    """按词义语义场归类：英文词形 + 中文释义双向匹配，取命中数最高的前两个主题。"""
    low = word.lower()
    zh = gloss or ''
    hit = {}
    for tid, keys in THEME_RULES:
        n = 0
        for k in keys:
            if re.search(r'[a-z]', k):
                # 英文关键词按词边界或子串匹配（允许派生：care → careful）
                if len(k) <= 4:
                    if re.search(r'\b' + re.escape(k) + r'\b', low):
                        n += 2
                elif k in low:
                    n += 2
            elif k in zh:
                n += 1
        if n:
            hit[tid] = n
    if not hit:
        return []
    return [t for t, _ in sorted(hit.items(), key=lambda kv: -kv[1])[:2]]


# ---------------------------------------------------------------- main
rows = []
with open(os.path.join(HERE, 'ecdict.csv'), newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        tags = (row.get('tag') or '').split()
        if 'zk' in tags:
            w = (row.get('word') or '').strip()
            if w and re.match(r"^[A-Za-z][A-Za-z' .\-]*$", w):
                rows.append(row)

# 去重（同词取词频更小的那条）
uniq = {}
for row in rows:
    key = row['word'].strip().lower()
    if key not in uniq or _int(row.get('frq')) and (_int(row.get('frq')) < _int(uniq[key].get('frq')) or not _int(uniq[key].get('frq'))):
        uniq[key] = row
rows = list(uniq.values())

words = []
for row in rows:
    w = row['word'].strip()
    key = w.lower()
    tr = row.get('translation') or ''
    ph = (row.get('phonetic') or '').strip()
    tag = band(row)

    if key in OVERRIDE:
        zh = OVERRIDE[key]
        pos0 = ''
    else:
        zh, pos0 = pick_gloss(tr, 2)
    if not zh:
        continue

    # 词性：人工表 > WordNet 投票 > 释义行前缀 > 兜底名词，统一规范化
    pos = (POS_OVERRIDE.get(key)
           or pos_from_definition(row.get('definition'))
           or pos0 or 'n')
    pos = POS_NORM.get(pos, 'n')
    tp = assign_themes(w, zh)
    if not tp:
        tp = ['general']
    # 短语（含空格）单独标记
    kind = 'phrase' if (' ' in w or '-' in w and ' ' in w) else 'word'
    if ' ' in w:
        kind = 'phrase'

    words.append({
        'w': w, 'pos': pos, 'posZh': POS_ZH.get(pos, '其他'),
        't': kind, 'zh': zh, 'ph': ph, 'tag': tag,
        'tp': tp, 'frq': _int(row.get('frq')),
    })

# 排序：核心 → 中频 → 拓展，同档按词频
rank = {'core': 0, 'mid': 1, 'ext': 2}
words.sort(key=lambda x: (rank[x['tag']], x['frq'] or 999999, x['w'].lower()))

# ---------------------------------------------------------------- 并入短语表
# ECDICT 只收单词，短语永远进不来；而中考单选/完形大量考动词与介词搭配，
# 所以短语走独立的手写源（reference/phrases.py）。
PHRASE_CAT = {'verb': '动词短语', 'be': 'be 结构', 'prep': '介词短语',
              'conj': '连词短语', 'noun': '名词短语'}
# 用文件路径显式加载，避免依赖 sys.path（-I 隔离模式下脚本目录不在 path 里）
import importlib.util as _ilu
_ph_path = os.path.join(HERE, 'phrases.py')
_spec = _ilu.spec_from_file_location('phrases', _ph_path)
_ph_mod = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_ph_mod)
PHRASES = _ph_mod.PHRASES
print('短语源载入', len(PHRASES), '条')

seen_phrase = {x['w'].lower() for x in words}
phrase_items = []
for phrase, zh, cat, ex in PHRASES:
    key = phrase.lower()
    if key in seen_phrase:
        continue
    seen_phrase.add(key)
    tp = assign_themes(phrase, zh) or ['general']
    phrase_items.append({
        'w': phrase, 'pos': 'phr', 'posZh': PHRASE_CAT.get(cat, '短语'),
        't': 'phrase', 'zh': zh, 'ph': '', 'tag': 'core',
        'tp': tp, 'frq': 0, 'ex': ex,
    })

phrase_items.sort(key=lambda x: x['w'].lower())
words = phrase_items + words

stats = {
    'total': len(words),
    'core': sum(1 for x in words if x['tag'] == 'core'),
    'mid': sum(1 for x in words if x['tag'] == 'mid'),
    'ext': sum(1 for x in words if x['tag'] == 'ext'),
    'words': sum(1 for x in words if x['t'] == 'word'),
    'phrases': sum(1 for x in words if x['t'] == 'phrase'),
}

# 只保留有词的主题
used = {t for x in words for t in x['tp']}
themes = [t for t in THEMES if t['id'] in used or t['id'] == 'general']

out = os.path.join(ROOT, 'src', 'data-words.js')
with open(out, 'w', encoding='utf-8') as f:
    f.write('/* 自动生成 — 来源 reference/build_words.py（ECDICT zk 标签）请勿手改 */\n')
    f.write('export const THEMES = ' + json.dumps(themes, ensure_ascii=False, indent=1) + ';\n')
    f.write('export const STATS = ' + json.dumps(stats, ensure_ascii=False, indent=1) + ';\n')
    f.write('export const WORDS = [\n')
    for x in words:
        f.write(json.dumps(x, ensure_ascii=False, separators=(',', ':')) + ',\n')
    f.write('];\n')

print('词条', stats['total'], '｜核心', stats['core'], '中频', stats['mid'], '拓展', stats['ext'],
      '｜单词', stats['words'], '短语', stats['phrases'])
print('主题分布:', {t['id']: sum(1 for x in words if t['id'] in x['tp']) for t in themes})
print('写入', out)
