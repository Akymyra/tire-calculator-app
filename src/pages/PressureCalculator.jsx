import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";

export default function TirePressureCalculator() {
  const [tirePressures, setTirePressures] = useState({});
  const [tireSizes, setTireSizes] = useState([]);
  const [selectedTire, setSelectedTire] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [load, setLoad] = useState("");
  const [wheels, setWheels] = useState("");
  const [recommended, setRecommended] = useState("");
  const [current, setCurrent] = useState("");

  const [history, setHistory] = useState({ tire: [], load: [], wheels: [], recommended: [], current: [] });
  const [showHistory, setShowHistory] = useState({ tire: false, load: false, wheels: false, recommended: false, current: false });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [toast, setToast] = useState({ type: "", msg: "" });
  const loaderRef = useRef(null);
  const resultsRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);

    fetch("/tirePressures.json")
      .then((res) => res.json())
      .then((data) => {
        setTirePressures(data);
        setTireSizes(Object.keys(data));
      });

    setHistory({
      tire: JSON.parse(localStorage.getItem("tireHistory") || "[]"),
      load: JSON.parse(localStorage.getItem("loadHistory") || "[]"),
      wheels: JSON.parse(localStorage.getItem("wheelsHistory") || "[]"),
      recommended: JSON.parse(localStorage.getItem("recommendedHistory") || "[]"),
      current: JSON.parse(localStorage.getItem("currentHistory") || "[]"),
    });

    setSelectedTire(localStorage.getItem("lastTire") || "");
    setLoad(localStorage.getItem("lastLoad") || "");
    setWheels(localStorage.getItem("lastWheels") || "");
    setRecommended(localStorage.getItem("lastRecommended") || "");
    setCurrent(localStorage.getItem("lastCurrent") || "");
  }, []);

  useEffect(() => {
    if (!toast.msg) return;
    const t = setTimeout(() => setToast({ type: "", msg: "" }), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // 👇 фиксированный скролл по центру
  useEffect(() => {
    if (showSpinner && loaderRef.current) {
      setTimeout(() => loaderRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "center"
      }), 200);
    }
  }, [showSpinner]);

  useEffect(() => {
    if (results && resultsRef.current) {
      setTimeout(() => resultsRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "center"
      }), 500);
    }
  }, [results]);

  const saveToHistory = (key, value) => {
    if (!value) return;
    const saved = JSON.parse(localStorage.getItem(`${key}History`) || "[]");
    if (!saved.includes(value)) {
      const updated = [value, ...saved].slice(0, 5);
      localStorage.setItem(`${key}History`, JSON.stringify(updated));
      setHistory((p) => ({ ...p, [key]: updated }));
    }
    localStorage.setItem(`last${key[0].toUpperCase() + key.slice(1)}`, value);
  };

  const showError = (msg) => setToast({ type: "error", msg });
  const showSuccess = (msg) => setToast({ type: "success", msg });

  const handleTireSelect = (tire) => {
    setSelectedTire(tire);
    setShowDropdown(false);
    if (tirePressures[tire]) {
      setRecommended(tirePressures[tire].single.toString());
    }
    saveToHistory("tire", tire);
  };

  const calculatePressure = () => {
    setResults(null);
    setShowSpinner(false);

    if (!load || !wheels || !recommended || !current || !selectedTire) {
      showError("⚠️ Введите все данные!");
      return;
    }

    const l = parseFloat(load);
    const w = parseInt(wheels, 10);
    const r = parseFloat(recommended);
    const c = parseFloat(current);

    if ([l, w, r, c].some((n) => isNaN(n) || n <= 0)) {
      showError("⚠️ Данные должны быть больше 0!");
      return;
    }

    saveToHistory("load", load);
    saveToHistory("wheels", wheels);
    saveToHistory("recommended", recommended);
    saveToHistory("current", current);

    setLoading(true);
    setShowSpinner(true);

    setTimeout(() => {
      const perWheelLoad = l / w;
      const diff = c - r;
      let advice = "✅ Давление в норме";
      if (diff < -0.2) advice = `⬆️ Подкачать на ${Math.abs(diff).toFixed(1)} бар`;
      if (diff > 0.2) advice = `⬇️ Снизить на ${diff.toFixed(1)} бар`;

      setResults({ perWheelLoad, recommended: r, current: c, diff, advice });
      setLoading(false);
      setShowSpinner(false);
      showSuccess("✅ Расчёт выполнен");
    }, 3000);
  };

  const renderInput = (label, value, setValue, key, type = "text") => (
    <div className="relative">
      <input
        type="text"
        value={value}
        onFocus={() => setShowHistory((p) => ({ ...p, [key]: true }))}
        onBlur={() => setTimeout(() => setShowHistory((p) => ({ ...p, [key]: false })), 150)}
        onChange={(e) => setValue(e.target.value)}
        className="w-full p-3 rounded-lg text-black pr-16"
        placeholder={label}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            localStorage.removeItem(`last${key[0].toUpperCase() + key.slice(1)}`);
          }}
          className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
        >
          ✖
        </button>
      )}
      {history[key]?.length > 0 && (
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(`${key}History`);
            setHistory((p) => ({ ...p, [key]: [] }));
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
        >
          🗑
        </button>
      )}
      {showHistory[key] && history[key]?.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
          {history[key].map((item, idx) => (
            <div
              key={idx}
              onMouseDown={() => setValue(item)}
              className="px-3 py-2 hover:bg-gray-200 cursor-pointer text-black text-sm"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3"
      style={{
        backgroundImage: "url('/fon.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#028cff",
      }}
    >
      {toast.msg && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 ${
            toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
          } text-white`}
        >
          {toast.msg}
        </div>
      )}

      <div
        className={`${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"} transform transition-all duration-700 ease-out
        w-full max-w-3xl p-6 rounded-2xl shadow-lg relative border text-center`}
        style={theme === "light" ? { backgroundColor: "#dce7f5", color: "#028cff" } : { backgroundColor: "rgba(40,60,80,0.6)", color: "#028cff" }}
      >
        {/* Назад */}
        <div className="absolute top-4 left-4">
          <Link to="/" className="text-base sm:text-lg font-semibold hover:underline" style={{ color: "#028cff" }}>
            ← Назад
          </Link>
        </div>

        {/* Тема */}
        <div className="absolute top-4 right-4">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={`p-2 rounded-full ${theme === "dark" ? "bg-orange-500" : "bg-blue-900"}`}>
            {theme === "dark" ? <Sun size={20} color="white" /> : <Moon size={20} color="white" />}
          </button>
        </div>

        {/* Лого / Заголовок */}
        <div className="flex justify-center">
          <img src="/logo.svg" alt="ВШК Альянс-Импорт" className="w-full max-w-[300px] h-auto" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-3">Калькулятор давления шин</h1>
          <p className="mb-4 text-sm max-w-xl mx-auto">
              Этот калькулятор поможет определить правильное давление в грузовых шинах.  
              Выберите размер из базы (или введите вручную), укажите нагрузку на ось и количество колёс.  
              Калькулятор автоматически подставит рекомендуемое давление для выбранного размера и подскажет, нужно ли подкачать или снизить давление.  
              <br />
              ⚠️ <b>Внимание:</b> рекомендуемое давление может быть неточным. Для точной информации всегда проверяйте данные производителя.
            </p>


        {/* Поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-left">
          {/* выбор шины */}
          <div className="relative">
            <input
              type="text"
              value={selectedTire}
              onChange={(e) => {
                setSelectedTire(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full p-3 rounded-lg text-black pr-16"
              placeholder="Размер шины (например, 315/80R22.5)"
            />
            {selectedTire && showDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                {tireSizes
                  .filter((s) => s.toLowerCase().includes(selectedTire.toLowerCase()))
                  .map((size, idx) => (
                    <div
                      key={idx}
                      onMouseDown={() => handleTireSelect(size)}
                      className="px-3 py-2 hover:bg-gray-200 cursor-pointer text-black text-sm"
                    >
                      {size}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {renderInput("Нагрузка на ось (кг)", load, setLoad, "load")}
          {renderInput("Количество колёс", wheels, setWheels, "wheels")}
          {renderInput("Рекомендуемое давление (бар)", recommended, setRecommended, "recommended")}
          {renderInput("Текущее давление (бар)", current, setCurrent, "current")}
        </div>

        <button onClick={calculatePressure} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold">
          Рассчитать
        </button>

        {/* Лоадер */}
        {loading && (
          <div ref={loaderRef} className="flex flex-row items-center justify-center gap-4 mt-4">
            {showSpinner && (
              <>
                <img src="/tire.png" alt="Загрузка" className="w-20 sm:w-28 h-auto animate-smooth-spin" />
                <p className="text-lg font-semibold" style={{ color: "#028cff" }}>
                  Идёт расчёт…
                </p>
              </>
            )}
          </div>
        )}

        {/* Результаты */}
        {results && (
          <div
            ref={resultsRef}
            className="mt-6 space-y-4 bg-white p-4 rounded-2xl shadow-lg text-center mx-auto"
            style={{ color: "#028cff", maxWidth: "100%" }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-3">Результаты расчёта</h2>
            <table className="border-collapse border border-gray-300 text-center w-full text-sm">
              <tbody>
                <tr>
                  <td className="border px-2 py-2">Нагрузка на одно колесо</td>
                  <td className="border px-2 py-2">{results.perWheelLoad.toFixed(1)} кг</td>
                </tr>
                <tr>
                  <td className="border px-2 py-2">Рекомендуемое давление</td>
                  <td className="border px-2 py-2">{results.recommended.toFixed(1)} бар</td>
                </tr>
                <tr>
                  <td className="border px-2 py-2">Текущее давление</td>
                  <td className="border px-2 py-2">{results.current.toFixed(1)} бар</td>
                </tr>
                <tr>
                  <td className="border px-2 py-2">Разница давления</td>
                  <td className="border px-2 py-2">{results.diff.toFixed(1)} бар</td>
                </tr>
                <tr>
                  <td className="border px-2 py-2 font-bold">Совет</td>
                  <td
                    className={`border px-2 py-2 font-bold ${
                      results.diff < -0.2 ? "text-red-600" : results.diff > 0.2 ? "text-orange-500" : "text-green-600"
                    }`}
                  >
                    {results.advice}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Анимация */}
        <style>{`
          @keyframes smooth-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-smooth-spin {
            animation: smooth-spin 1.2s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}





