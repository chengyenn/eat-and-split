import { useState } from "react";

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

// 按下 Add friend 時這邊的 onclick=handleShowAddFriend
// 但如果是按下好友的 select，這邊的 onclick= () => onSelection(friendObj)
function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default function App() {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friends, setFriends] = useState(initialFriends);
  const [selectedFriend, setSelectedFriend] = useState(null);

  function handleShowAddFriend() {
    setShowAddFriend((showAdd) => !showAdd);
  }

  function handleAddFriend(newFriend) {
    // 建立新 Array 然後複製原本 Array 的內容後，加入新的 Object
    // push 則會更新舊 Array，這會使 React 不會重新渲染
    setFriends((friends) => [...friends, newFriend]);
    setShowAddFriend(false);
  }

  function handleSelection(friendObj) {
    // selectedFriend !== friendObj
    //   ? setSelectedFriend(friendObj)
    //   : setSelectedFriend(null);
    setSelectedFriend((curSelected) =>
      curSelected?.id !== friendObj.id ? friendObj : null
    );
    setShowAddFriend(false);
  }

  function handleSplitBill(value) {
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id
          ? { ...friend, balance: friend.balance + value }
          : friend
      )
    );
    setSelectedFriend(null);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <FriendsList
          friendsArray={friends}
          onSelection={handleSelection}
          selectedFriend={selectedFriend}
        />
        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}
        <Button onClick={handleShowAddFriend}>
          {showAddFriend ? "Close" : "Add Friend"}
        </Button>
      </div>

      {selectedFriend && (
        <FormSplitBill
          friendObj={selectedFriend}
          onSplitBill={handleSplitBill}
        />
      )}
    </div>
  );
}

function FriendsList({ friendsArray, onSelection, selectedFriend }) {
  return (
    <ul>
      {friendsArray.map((friend) => (
        <Friend
          friendObj={friend}
          key={friend.id}
          onSelection={onSelection}
          selectedFriend={selectedFriend}
        />
      ))}
    </ul>
  );
}

function Friend({ friendObj, onSelection, selectedFriend }) {
  const isSelected = selectedFriend?.id === friendObj.id;

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friendObj.image} alt={friendObj.name} />
      <h3>{friendObj.name}</h3>

      <p
        className={
          friendObj.balance < 0 ? "red" : friendObj.balance > 0 ? "green" : ""
        }
      >
        {friendObj.balance < 0
          ? `You owe ${friendObj.name} NT$ ${Math.abs(friendObj.balance)}`
          : friendObj.balance > 0
          ? `${friendObj.name} owes you NT$ ${friendObj.balance}`
          : `You and ${friendObj.name} are even`}
      </p>

      {/* 這邊的 onClick 會當成 prop 傳給 button component 再執行，而不是在這邊直接執行*/}
      <Button onClick={() => onSelection(friendObj)}>
        {isSelected ? "Close" : "Select"}
      </Button>
    </li>
  );
}

function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("https://i.pravatar.cc/48");

  function handleSubmit(event) {
    event.preventDefault();

    if (!name || !image) return;

    // 在瀏覽器中隨機生成 ID
    const id = crypto.randomUUID();
    const newFriend = {
      id,
      name,
      image: `${image}?=${id}`,
      balance: 0,
    };

    console.log(newFriend);

    onAddFriend(newFriend);

    setName("");
    setImage("https://i.pravatar.cc/48");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>👯 Friend Name</label>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <label>🌄 Image URL</label>
      <input
        type="text"
        value={image}
        onChange={(event) => setImage(event.target.value)}
      />

      <Button>Add</Button>
    </form>
  );
}

function FormSplitBill({ friendObj, onSplitBill }) {
  const [bill, setBill] = useState("");
  const [paidByUser, setPaidByUser] = useState("");

  // 一開始 bill 為空字串，所以要建立一下保護機制
  const paidByFriend = bill ? bill - paidByUser : "";
  const [whoIsPaying, setWhoIsPaying] = useState("user");

  function handleSubmit(event) {
    event.preventDefault();

    if (!bill || !paidByUser) return;
    onSplitBill(whoIsPaying === "user" ? paidByFriend : -paidByUser);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>SPLIT A BILL WITH {friendObj.name}</h2>

      <label>💰 Bill Value</label>
      <input
        type="text"
        value={bill}
        onChange={(event) => setBill(Number(event.target.value))}
      />

      <label>🧍‍♀️ Your Expense</label>
      <input
        type="text"
        value={paidByUser}
        // 避免 User 要付的錢大於帳單的錢，因此當輸入值大於帳單就維持原本值，反之才更新新輸入的值
        onChange={(event) =>
          setPaidByUser(
            Number(event.target.value) > bill
              ? paidByUser
              : Number(event.target.value)
          )
        }
      />

      <label>👯 {friendObj.name}'s Expense</label>
      <input type="text" disabled value={paidByFriend} />

      <label>🤑 Who is paying the bill?</label>
      <select
        value={whoIsPaying}
        onChange={(event) => setWhoIsPaying(event.target.value)}
      >
        <option value="user">You</option>
        <option value="friend">{friendObj.name}</option>
      </select>

      <Button>Split Bill</Button>
    </form>
  );
}
