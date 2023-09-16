import { useState, PropsWithChildren, useEffect, ReactNode } from "react";

const defaultCardsData: CardData[] = [
  { id: "abc", english: "Hello", kurdish: "سڵاو" },
  { id: "def", english: "Goodbye", kurdish: "بابە" },
];
const local = localStorage.getItem("cardsData");
const localCardsData = local ? JSON.parse(local) : [];
const startCardsData =
  localCardsData.length > 0 ? localCardsData : defaultCardsData;

function useCardsData() {
  const [cardsData, setCardsData] = useState<CardData[]>(startCardsData);
  useEffect(() => {
    localStorage.setItem("cardsData", JSON.stringify(cardsData));
  }, [cardsData]);
  const removeCard = (card: CardData) => {
    setCardsData((cardsData) => cardsData.filter((c) => c.id !== card.id));
  };
  const addCard = (card: CardData) => {
    setCardsData((cardsData) => [...cardsData, card]);
  };
  const editCard = (card: CardData) => {
    setCardsData((cardsData) =>
      cardsData.map((c) => (c.id === card.id ? card : c)),
    );
  };
  return { cardsData, setCardsData, removeCard, addCard, editCard } as const;
}

type AllowedState = "import" | "view" | "alphabet";

interface NavBarProps {
  name: string;
}

function exportCardsDatatoJSON(cardsData: CardData[]) {
  const data = JSON.stringify(cardsData);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = "cards.json";
  link.href = url;
  link.click();
}

function NavBar({ children, name }: PropsWithChildren<NavBarProps>) {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {children &&
              (children as ReactNode[]).map((child, i) => (
                <li key={i}>{child}</li>
              ))}
          </ul>
        </div>
        <a className="btn btn-ghost normal-case text-xl">{name}</a>
      </div>
      <div className="navbar-end hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {children &&
            (children as ReactNode[]).map((child, i) => (
              <li key={i}>{child}</li>
            ))}
        </ul>
      </div>
    </div>
  );
}

interface CardProps {
  cardData: CardData;
  editCard: (card: CardData) => void;
  removeCard: (card: CardData) => void;
}

function Card({ cardData, editCard, removeCard }: CardProps) {
  const [editing, setEditing] = useState(false);
  return editing ? (
    <EditOrAdd
      cardData={cardData}
      editCard={editCard}
      setEditing={setEditing}
    />
  ) : (
    <div className="card w-96 h-56 bordered">
      <div className="card-body">
        <h2 className="card-title">{cardData.english}</h2>
        <p>{cardData.kurdish}</p>
        <div className="card-actions justify-end">
          <button onClick={() => setEditing(true)} className="btn">
            Edit
          </button>
          <button
            onClick={() => removeCard(cardData)}
            className="btn btn-error"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
interface ShowProps {
  cardsData: CardData[];
  addCard: (card: CardData) => void;
  removeCard: (card: CardData) => void;
  editCard: (card: CardData) => void;
}
function Show({ cardsData, addCard, removeCard, editCard }: ShowProps) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col gap-2 items-center lg:justify-center lg:flex-row lg:flex-wrap">
        {cardsData.map((cardData) => (
          <Card
            key={cardData.id}
            cardData={cardData}
            removeCard={removeCard}
            editCard={editCard}
          />
        ))}
        {adding && <EditOrAdd addCard={addCard} setEditing={setAdding} />}
      </div>
      {!adding && (
        <button className="btn w-40" onClick={() => setAdding(true)}>
          Add card
        </button>
      )}
    </div>
  );
}

interface CardData {
  id: string;
  english: string;
  kurdish: string;
}

interface EditProps {
  cardData?: CardData;
  editCard?: (card: CardData) => void;
  addCard?: (card: CardData) => void;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

function EditOrAdd({ cardData, editCard, addCard, setEditing }: EditProps) {
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const english = (e.currentTarget[0] as HTMLInputElement).value;
    const kurdish = (e.currentTarget[1] as HTMLInputElement).value;
    if (cardData) {
      editCard?.({ id: cardData.id, english, kurdish });
    } else {
      addCard?.({ id: crypto.randomUUID(), english, kurdish });
    }
    setEditing(false);
  };
  return (
    <div className="card bordered w-96 h-56">
      <div className="card-body">
        <form className="form-control gap-5" onSubmit={submit}>
          <input
            autoFocus
            type="text"
            placeholder="English"
            className="input input-bordered input-sm"
            defaultValue={cardData ? cardData.english : ""}
          />
          <input
            type="text"
            placeholder="Kurdish"
            className="input input-bordered input-sm"
            defaultValue={cardData ? cardData.kurdish : ""}
          />
          <div className="card-actions justify-end">
            <button className="btn">Save</button>
            <button className="btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ImportProps {
  setCardsData: React.Dispatch<React.SetStateAction<CardData[]>>;
  setState: React.Dispatch<React.SetStateAction<AllowedState>>;
}

/** Import cards data from json file on local computer. */
function Import({ setCardsData, setState }: ImportProps) {
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = (e.currentTarget[0] as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (typeof data === "string") {
          const cardsData = JSON.parse(data);
          setCardsData(cardsData);
          setState("view");
        }
      };
      reader.readAsText(file);
    }
  };
  return (
    <div className="flex justify-center">
      <div className="card bordered w-96 h-56">
        <div className="card-body">
          <h2 className="card-title">Import</h2>
          <form className="form-control" onSubmit={submit}>
            <input autoFocus type="file" className="file-input file-input-bordered my-5" />
            <div className="card-actions justify-end">
              <button className="btn">Import</button>
              <button className="btn" onClick={() => setState("view")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface LetterInfo {
  alone: string;
  initial: string;
  middle: string;
  final: string;
  english: string;
  description: string;
}

const letters: LetterInfo[] = [
  {
    alone: "ب",
    initial: "بـ",
    middle: "ـبـ",
    final: "ـب",
    english: "b",
    description: "pronounced like in english",
  },
  {
    alone: "پ",
    initial: "پـ",
    middle: "ـپـ",
    final: "ـپ",
    english: "p",
    description: "pronounced like in english",
  },
  {
    alone: "ت",
    initial: "تـ",
    middle: "ـتـ",
    final: "ـت",
    english: "t",
    description: "pronounced like in english",
  },
  {
    alone: "ج",
    initial: "جـ",
    middle: "ـجـ",
    final: "ـج",
    english: "j",
    description: "pronounced like in english",
  },
  {
    alone: "چ",
    initial: "چـ",
    middle: "ـچـ",
    final: "ـچ",
    english: "ch",
    description: "pronounced like in english",
  },
  {
    alone: "خ",
    initial: "خـ",
    middle: "ـخـ",
    final: "ـخ",
    english: "kh",
    description: "pronounced like in english",
  },
  {
    alone: "د",
    initial: "د",
    middle: "ـد",
    final: "ـد",
    english: "d",
    description: "pronounced like in english",
  },
  {
    alone: "ر",
    initial: "ر",
    middle: "ـر",
    final: "ـر",
    english: "r",
    description: "pronounced like in english",
  },
  {
    alone: "ڕ",
    initial: "ڕ",
    middle: "ـڕ",
    final: "ـڕ",
    english: "r",
    description: "pronounced like in english",
  },
  {
    alone: "ز",
    initial: "ز",
    middle: "ـز",
    final: "ـز",
    english: "z",
    description: "pronounced like in english",
  },
  {
    alone: "ژ",
    initial: "ژ",
    middle: "ـژ",
    final: "ـژ",
    english: "zh",
    description: "pronounced like in english",
  },
  {
    alone: "س",
    initial: "سـ",
    middle: "ـسـ",
    final: "ـس",
    english: "s",
    description: "pronounced like in english",
  },
  {
    alone: "ش",
    initial: "شـ",
    middle: "ـشـ",
    final: "ـش",
    english: "sh",
    description: "pronounced like in english",
  },
  {
    alone: "ف",
    initial: "فـ",
    middle: "ـفـ",
    final: "ـف",
    english: "f",
    description: "pronounced like in english",
  },
  {
    alone: "ڤ",
    initial: "ڤـ",
    middle: "ـڤـ",
    final: "ـڤ",
    english: "v",
    description: "pronounced like in english",
  },
  {
    alone: "گ",
    initial: "گـ",
    middle: "ـگـ",
    final: "ـگ",
    english: "g",
    description: "pronounced like in english",
  },
  {
    alone: "ک",
    initial: "کـ",
    middle: "ـکـ",
    final: "ـک",
    english: "k",
    description: "pronounced like in english",
  },
  {
    alone: "ق",
    initial: "قـ",
    middle: "ـقـ",
    final: "ـق",
    english: "q",
    description: "pronounced like in english",
  },
  {
    alone: "ل",
    initial: "لـ",
    middle: "ـلـ",
    final: "ـل",
    english: "l",
    description: "pronounced like in english",
  },
  {
    alone: "ڵ",
    initial: "ڵـ",
    middle: "ـڵـ",
    final: "ـڵ",
    english: "l",
    description: "pronounced like in english",
  },
  {
    alone: "م",
    initial: "مـ",
    middle: "ـمـ",
    final: "ـم",
    english: "m",
    description: "pronounced like in english",
  },
  {
    alone: "ن",
    initial: "نـ",
    middle: "ـنـ",
    final: "ـن",
    english: "n",
    description: "pronounced like in english",
  },
  {
    alone: "ه",
    initial: "هـ",
    middle: "ـهـ",
    final: "ـه",
    english: "h",
    description: "pronounced like in english",
  },
  {
    alone: "و",
    initial: "و",
    middle: "ـو",
    final: "ـو",
    english: "w",
    description: "pronounced like in english",
  },
  {
    alone: "ۆ",
    initial: "ۆ",
    middle: "ـۆ",
    final: "ـۆ",
    english: "o",
    description: "pronounced like in english",
  },
  {
    alone: "ی",
    initial: "ی",
    middle: "ـی",
    final: "ـی",
    english: "y",
    description: "pronounced like in english",
  },
  {
    alone: "ێ",
    initial: "ێ",
    middle: "ـێ",
    final: "ـێ",
    english: "e",
    description: "pronounced like in english",
  },
  {
    alone: "ا",
    initial: "ئا",
    middle: "ـا",
    final: "ـا",
    english: "a",
    description: "pronounced like in english",
  },
  {
    alone: "ە",
    initial: "ئە",
    middle: "ـە",
    final: "ـە",
    english: "e",
    description: "pronounced like in english",
  },
];

function Alphabet() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {letters.map((letter, i) => (
        <label className="swap swap-flip">
          <input type="checkbox" />
          <div key={i} className="card bordered w-40 h-40 swap-on">
            <div className="card-body">
              <h2 className="card-title">{letter.english}</h2>
              <div className="flex flex-row-reverse">
                <p>{letter.initial}</p>
                <p>{letter.middle}</p>
                <p>{letter.final}</p>
                <p>{letter.alone}</p>
              </div>
            </div>
          </div>
          <div key={i} className="card bordered w-40 h-40 swap-off">
            <div className="card-body">
              <h2 className="card-title">{letter.alone}</h2>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}

function App() {
  const [state, setState] = useState<AllowedState>("view");
  const { cardsData, setCardsData, removeCard, addCard, editCard } =
    useCardsData();
  return (
    <div>
      <NavBar name="سۆرانی">
        <button onClick={() => setState("import")}>Import</button>
        <button onClick={() => exportCardsDatatoJSON(cardsData)}>Export</button>
        <button onClick={() => setState("view")}>View</button>
        <button onClick={() => setState("alphabet")}>Alphabet</button>
      </NavBar>
      <div className="container mx-auto">
        {state === "view" ? (
          <Show
            cardsData={cardsData}
            addCard={addCard}
            removeCard={removeCard}
            editCard={editCard}
          />
        ) : null}
        {state === "import" ? (
          <Import setCardsData={setCardsData} setState={setState} />
        ) : null}
        {state === "alphabet" ? <Alphabet /> : null}
      </div>
    </div>
  );
}

export default App;
