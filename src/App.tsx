import { useState, PropsWithChildren, useEffect } from "react";

type AllowedState = "import" | "view";

interface NavBarProps {
  name: string;
}

function exportCardsDatatoJSON(cardsData: CardData[]) {
  const data = JSON.stringify(cardsData);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'cards.json';
  link.href = url;
  link.click();
}

function NavBar({
  children,
  name
}: PropsWithChildren<NavBarProps>) {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">{name}</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {children}
        </ul>
      </div>
    </div>
  )
}

interface CardProps {
  cardData: CardData;
  setCardsData: React.Dispatch<React.SetStateAction<CardData[]>>;
}

function Card({cardData, setCardsData}: CardProps) {
  const [editing, setEditing] = useState(false);
  return (
    editing ? (
      <AddOrEdit cardData={cardData} setCardsData={setCardsData} setEditing={setEditing} />
    ) : (
    <div className="card bordered">
      <div className="card-body">
        <h2 className="card-title">{cardData.english}</h2>
        <p>{cardData.kurdish}</p>
        <div className="card-actions justify-end">
          <button onClick={()=>setEditing(true)} className="btn">
            Edit
          </button>
          <button 
            onClick={()=>setCardsData((cardsData) => cardsData.filter((card) => card.id !== cardData.id))}
            className="btn btn-error"
          >Delete</button>
        </div>
      </div>
    </div>
    )
  )
}
interface ShowProps {
  cardsData: CardData[];
  setCardsData: React.Dispatch<React.SetStateAction<CardData[]>>;
}
function Show({cardsData, setCardsData}: ShowProps) {
  const [adding, setAdding] = useState(false);
  return (
    <>
      {cardsData.map((cardData) => (
        <Card key={cardData.id} cardData={cardData} setCardsData={setCardsData} />
      ))}
      {adding ? (
        <AddOrEdit setCardsData={setCardsData} setEditing={setAdding} /> 
      ): (
        <button className="btn" onClick={() => setAdding(true)}>Add card</button>
      )}
    </>
  )
}

interface CardData {
  id: string;
  english: string;
  kurdish: string;
}

const defaultCardsData: CardData[] = [
  {
    id: "abc",
    english: "Hello",
    kurdish: "سڵاو"
  },
  {
    id: "def",
    english: "Goodbye",
    kurdish: "بابە"
  }
];

interface AddOrEditProps {
  cardData?: CardData;
  setCardsData: React.Dispatch<React.SetStateAction<CardData[]>>;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

function AddOrEdit({cardData, setCardsData, setEditing}: AddOrEditProps) {
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const english = (e.currentTarget[0] as HTMLInputElement).value;
    const kurdish = (e.currentTarget[1] as HTMLInputElement).value;
    let editCard: (cards: CardData[]) => CardData[];
    if (cardData) {
      editCard = (cards: CardData[]) => cards.map((card) => card.id === cardData.id ? {id: cardData.id, english, kurdish} : card)
    } else {
      editCard = (cards: CardData[]) => [...cards, {id: crypto.randomUUID(), english, kurdish}]
    }
    setCardsData(editCard);
    setEditing(false)
  }
  return (
    <div className="card bordered">
      <div className="card-body">
        <form className="form-control" onSubmit={submit}>
          <input autoFocus type="text" placeholder="English" className="input input-bordered" defaultValue={cardData ? cardData.english : ""} />
          <input type="text" placeholder="Kurdish" className="input input-bordered" defaultValue={cardData? cardData.kurdish: ""} />
          <button className="btn">Save</button>
          <button className="btn" onClick={()=>setEditing(false)}>Cancel</button>
        </form>
      </div>
    </div>
  )
}


interface ImportProps {
  setCardsData: React.Dispatch<React.SetStateAction<CardData[]>>;
  setState: React.Dispatch<React.SetStateAction<AllowedState>>;
}

/** Import cards data from json file on local computer. */
function Import({setCardsData, setState}: ImportProps) {
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
      }
      reader.readAsText(file);
    }
  }
  return (
    <div className="card bordered">
      <div className="card-body">
        <form className="form-control" onSubmit={submit}>
          <input autoFocus type="file" />
          <button className="btn">Import</button>
          <button className="btn" onClick={()=>setState("view")}>Cancel</button>
        </form>
      </div>
    </div>
  )
}

const localCardsData = localStorage.getItem("cardsData");
const startCardsData = localCardsData ? JSON.parse(localCardsData) : defaultCardsData;

function App() {
  const [state, setState] = useState<AllowedState>("view");
  const [cardsData, setCardsData] = useState<CardData[]>(startCardsData);
  useEffect(() => {
    localStorage.setItem("cardsData", JSON.stringify(cardsData));
  }, [cardsData]);
  return (
    <div>
        <NavBar name="سۆرانی">
          <li><button onClick={() => setState("import")}>Import</button></li>
          <li><button onClick={() => exportCardsDatatoJSON(cardsData)}>Export</button></li>
          <li><button onClick={() => setState("view")}>View</button></li>
        </NavBar>
      <div className="container mx-auto">
        {state === "view" ? <Show cardsData={cardsData} setCardsData={setCardsData}/> : null}
        {state === "import" ? <Import setCardsData={setCardsData} setState={setState}/> : null}
      </div>
    </div>
  )
}

export default App
