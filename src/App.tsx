function App() {
  return (
  <div className="navbar bg-base-100">
    <div className="flex-1">
      <a className="btn btn-ghost normal-case text-xl">سۆرانی</a>
    </div>
    <div className="flex-none">
      <ul className="menu menu-horizontal px-1">
        <li><a>Add</a></li>
        <li><a>Import</a></li>
        <li><a>Export</a></li>
      </ul>
    </div>
  </div>
  )
}

export default App
