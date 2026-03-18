import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useAuth } from "../context/AuthContext";
import { addQuote } from "../data/quotes";
import type { Book } from "../types";

interface BookReaderProps {
  book: Book;
  onQuoteAdded: () => void;
}

const getMockBookText = (bookTitle: string) => {
  return `Глава 1

Было раннее утро, когда главный герой проснулся от звука дождя за окном. Капли стучали по стеклу мелодичным ритмом, создавая атмосферу уюта и спокойствия. Он потянулся, чувствуя, как тело медленно просыпается после долгого сна.

В комнате царил полумрак. Серый свет пробивался сквозь занавески, освещая книжные полки, заполненные старыми томами. Каждая книга здесь была другом, хранителем историй и знаний, накопленных за годы.

"Сегодня особенный день," - подумал он, поднимаясь с постели. События, которые должны были произойти сегодня, могли изменить всё. Но он был готов встретить эти перемены лицом к лицу.

Глава 2

Спустившись на кухню, он приготовил себе чашку ароматного кофе. Запах свежесваренного напитка наполнил пространство, смешиваясь с запахом дождя, проникающим через приоткрытое окно.

Он сел за стол и взглянул на записную книжку, лежащую перед ним. Страницы были исписаны мелким почерком - заметки, мысли, планы. Всё это было частью его жизни, частью того, кем он стал.

"Жизнь - это история, которую мы пишем каждый день," - прошептал он, открывая новую страницу. Сегодня начинается новая глава, и он готов её написать.

Глава 3

Дождь продолжался весь день. Улицы города были пусты, лишь изредка мимо проезжали машины, оставляя за собой волны воды. Люди прятались в своих домах, наслаждаясь теплом и уютом.

Он шёл по мокрым тротуарам, не обращая внимания на дождь. Его мысли были заняты предстоящей встречей. Человек, с которым он должен был увидеться, мог дать ответы на вопросы, мучившие его долгие месяцы.

Старое кафе на углу улицы показалось вдалеке. Тёплый свет из окон приглашал войти и согреться. Именно здесь должна была состояться встреча, которая изменит всё.

Глава 4

Внутри кафе было тепло и уютно. За столиками сидели немногочисленные посетители, каждый погружённый в свой мир. Кто-то читал книгу, кто-то работал за ноутбуком, а кто-то просто смотрел в окно, наблюдая за дождём.

Он огляделся, ища знакомое лицо. И вот, в дальнем углу, за столиком у окна, сидел тот, кого он искал. Их взгляды встретились, и время словно остановилось на мгновение.

"Я ждал тебя," - сказал незнакомец, когда он подошёл ближе. - "У меня есть то, что ты ищешь. Но готов ли ты узнать правду?"

Эти слова повисли в воздухе, тяжёлые и значимые. Готов ли он? Он кивнул, садясь напротив. Правда всегда лучше неизвестности, даже если она болезненна.

Глава 5

Разговор длился несколько часов. За это время дождь начал стихать, небо постепенно светлело. История, которую он услышал, была невероятной, но каждое слово звучало правдиво.

Оказалось, что прошлое гораздо сложнее, чем он мог себе представить. События, люди, решения - всё было связано невидимыми нитями, создавая сложный узор судьбы.

"Что мне теперь делать?" - спросил он, когда история была рассказана. Незнакомец улыбнулся - улыбкой мудрого человека, видевшего многое в жизни.

"Живи. Помни. И пиши свою историю дальше. Прошлое важно, но будущее ещё не написано. Ты держишь перо в своих руках."

Эпилог

Вечер застал его снова дома, за письменным столом. Дождь полностью прекратился, и сквозь облака пробивались первые звёзды. Город оживал после дневного затишья.

Он взял ручку и начал писать. Слова лились сами собой, образуя предложения, абзацы, страницы. Это была его история - история поиска, открытий и надежды.

Жизнь продолжается, история пишется дальше. И каждый день - это новая страница, полная возможностей и выборов. Главное - не бояться писать, не бояться жить.

"Конец - это всегда начало чего-то нового," - написал он последнюю строку. И закрыл тетрадь, глядя в ночное небо за окном.`;
};

export function BookReader({ book, onQuoteAdded }: BookReaderProps) {
  const [selectedText, setSelectedText] = useState("");
  const [note, setNote] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const { user } = useAuth();

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      setShowQuoteForm(true);
    }
  };

  const handleAddQuote = () => {
    if (!user || !selectedText) return;

    const quote = {
      id: Date.now().toString(),
      bookId: book.id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      text: selectedText,
      date: new Date().toISOString().split('T')[0]
    };

    addQuote(quote);
    setSelectedText("");
    setNote("");
    setShowQuoteForm(false);
    onQuoteAdded();
    
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Читать онлайн</CardTitle>
          <p className="text-sm text-muted">
            Выделите текст, чтобы добавить его в цитатник
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="p-6 rounded-lg leading-relaxed whitespace-pre-wrap select-text section-muted"
            onMouseUp={handleTextSelection}
          >
            {getMockBookText(book.title)}
          </div>
        </CardContent>
      </Card>

      {showQuoteForm && user && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Добавить в цитатник</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border-l-4 border-primary" style={{ background: "color-mix(in srgb, var(--muted) 50%, transparent)" }}>
              <p className="text-sm italic">{selectedText}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddQuote} className="flex-1">
                Добавить цитату
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuoteForm(false);
                  setSelectedText("");
                  setNote("");
                }}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card style={{ borderColor: "#eab308", background: "#fef9c3" }}>
          <CardContent className="pt-6">
            <p className="text-sm" style={{ color: "#854d0e" }}>
              Войдите в систему, чтобы добавлять цитаты в свой цитатник
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
