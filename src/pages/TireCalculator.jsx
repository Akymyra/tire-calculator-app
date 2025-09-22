import React, { useEffect, useRef, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";

export default function TireCalculator() {
  const [theme, setTheme] = useState("dark");
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });

  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const loaderRef = useRef(null);
  const resultsRef = useRef(null);

  // поля
  const [oldTire, setOldTire] = useState("");
  const [newTire, setNewTire] = useState("");
  const [oldWheelWidth, setOldWheelWidth] = useState("");
  const [oldWheelET, setOldWheelET] = useState("");
  const [newWheelWidth, setNewWheelWidth] = useState("");
  const [newWheelET, setNewWheelET] = useState("");

  const [results, setResults] = useState(null);

  // история
  const [history, setHistory] = useState({});
  const [showHistory, setShowHistory] = useState({});

  // ===== useEffect =====
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast.msg) return;
    const t = setTimeout(() => setToast({ type: "", msg: "" }), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (loading && loaderRef.current) {
      const t = setTimeout(() => loaderRef.current.scrollIntoView({ behavior: "smooth" }), 400);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    if (results && resultsRef.current) {
      const t = setTimeout(() => resultsRef.current.scrollIntoView({ behavior: "smooth" }), 400);
      return () => clearTimeout(t);
    }
  }, [results]);

  // ===== Парсер шин =====
  const parseTire = (input) => {
    input = input.trim().toUpperCase().replace(",", ".");

    const metric = /^(\d{3})\/(\d{2})R(\d{2}(\.\d)?)$/;
    if (metric.test(input)) {
      const [, w, p, r] = input.match(metric);
      return { width: parseInt(w, 10), profile: parseInt(p, 10), rim: parseFloat(r) };
    }

    const inch = /^(\d{2})R(\d{2}(\.\d)?)$/;
    if (inch.test(input)) {
      const [, w, r] = input.match(inch);
      return { width: parseInt(w, 10) * 25.4, profile: 90, rim: parseFloat(r) };
    }

    return null;
  };

  const calcTireParams = ({ width, profile, rim }) => {
    const side = (width * profile) / 100;
    const diameter = rim * 25.4 + 2 * side;
    const circumference = Math.PI * diameter;
    return { diameter, circumference, clearance: diameter / 2 };
  };

  // ===== История =====
  const saveToHistory = (key, value) => {
    if (!value) return;
    const updated = [value, ...(history[key] || [])]
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .slice(0, 5);
    setHistory((prev) => ({ ...prev, [key]: updated }));
    localStorage.setItem(`tireCalc_${key}`, JSON.stringify(updated));
    localStorage.setItem(`last_${key}`, value);
  };

  useEffect(() => {
    const loaded = {};
    ["oldTire", "newTire", "oldWheelWidth", "oldWheelET", "newWheelWidth", "newWheelET"].forEach(
      (key) => {
        loaded[key] = JSON.parse(localStorage.getItem(`tireCalc_${key}`) || "[]");
        const last = localStorage.getItem(`last_${key}`);
        if (last) {
          switch (key) {
            case "oldTire":
              setOldTire(last);
              break;
            case "newTire":
              setNewTire(last);
              break;
            case "oldWheelWidth":
              setOldWheelWidth(last);
              break;
            case "oldWheelET":
              setOldWheelET(last);
              break;
            case "newWheelWidth":
              setNewWheelWidth(last);
              break;
            case "newWheelET":
              setNewWheelET(last);
              break;
            default:
              break;
          }
        }
      }
    );
    setHistory(loaded);
  }, []);

  // ===== Расчёт =====
  const calc = () => {
    setResults(null);
    setShowSpinner(false);

    if (!oldTire || !newTire || !oldWheelWidth || !oldWheelET || !newWheelWidth || !newWheelET) {
      setToast({ type: "error", msg: "⚠️ Заполните все поля!" });
      return;
    }

    const oldParsed = parseTire(oldTire);
    const newParsed = parseTire(newTire);
    if (!oldParsed || !newParsed) {
      setToast({ type: "error", msg: "⚠️ Неверный формат шин!" });
      return;
    }

    saveToHistory("oldTire", oldTire);
    saveToHistory("newTire", newTire);
    saveToHistory("oldWheelWidth", oldWheelWidth);
    saveToHistory("oldWheelET", oldWheelET);
    saveToHistory("newWheelWidth", newWheelWidth);
    saveToHistory("newWheelET", newWheelET);

    setLoading(true);
    setTimeout(() => setShowSpinner(true), 500);

    setTimeout(() => {
      const oldParams = calcTireParams(oldParsed);
      const newParams = calcTireParams(newParsed);

      const diff = newParams.diameter - oldParams.diameter;
      const percent = (diff / oldParams.diameter) * 100;
      const clearanceDiff = newParams.clearance - oldParams.clearance;
      const speedoError = (newParams.circumference / oldParams.circumference - 1) * 100;

      const ow = parseFloat(oldWheelWidth) * 25.4;
      const nw = parseFloat(newWheelWidth) * 25.4;
      const oET = parseFloat(oldWheelET);
      const nET = parseFloat(newWheelET);

      const innerOld = ow / 2 - oET;
      const innerNew = nw / 2 - nET;
      const outerOld = ow / 2 + oET;
      const outerNew = nw / 2 + nET;

      setResults({
        oldParams,
        newParams,
        diff,
        percent,
        clearanceDiff,
        speedoError,
        innerOld,
        innerNew,
        outerOld,
        outerNew,
        innerDiff: innerNew - innerOld,
        outerDiff: outerNew - outerOld,
      });
      setLoading(false);
      setShowSpinner(false);
      setToast({ type: "success", msg: "✅ Расчёт выполнен" });
    }, 2500);
  };

  // ===== Вспомогательные =====
  const renderInput = ({ keyName, label, value, setValue }) => (
    <div className="relative mb-2">
      <input
        type="text"
        value={value}
        onFocus={() => setShowHistory((p) => ({ ...p, [keyName]: true }))}
        onBlur={() => setTimeout(() => setShowHistory((p) => ({ ...p, [keyName]: false })), 200)}
        onChange={(e) => setValue(e.target.value.replace(",", "."))}
        placeholder={label}
        className="w-full p-3 rounded-lg text-black pr-16"
      />
      <button
        type="button"
        onClick={() => {
          setValue("");
          localStorage.removeItem(`last_${keyName}`);
        }}
        className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
      >
        ✖
      </button>
      {history[keyName]?.length > 0 && (
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(`tireCalc_${keyName}`);
            setHistory((prev) => ({ ...prev, [keyName]: [] }));
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
        >
          🗑
        </button>
      )}
      {showHistory[keyName] && history[keyName]?.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
          {history[keyName].map((item, idx) => (
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

  const getDiffClass = (valPercent) => {
    if (Math.abs(valPercent) <= 3) return "text-green-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const describeResults = (r) => {
    if (!r) return null;
    return (
      <div className="text-sm text-left space-y-2">
        <p>
          <b>Диаметр:</b> разница {r.diff.toFixed(1)} мм ({r.percent.toFixed(2)}%). Это влияет на общий размер
          колеса и совместимость с арками.{" "}
          {Math.abs(r.percent) <= 3 ? "В пределах нормы." : "Отклонение значительное, есть риск проблем."}
        </p>
        <p>
          <b>Окружность:</b> разница {(r.newParams.circumference - r.oldParams.circumference).toFixed(1)} мм.
          Это напрямую связано со спидометром и пробегом.{" "}
          {Math.abs(r.speedoError) <= 3 ? "В пределах нормы." : "Отклонение может исказить показания."}
        </p>
        <p>
          <b>Клиренс:</b> изменился на {r.clearanceDiff.toFixed(1)} мм. Влияет на дорожный просвет и комфорт.
          {Math.abs(r.clearanceDiff) <= 10 ? " Допустимо." : " Может привести к зацепам или ударам."}
        </p>
        <p>
          <b>Спидометр:</b> ошибка {r.speedoError.toFixed(2)}%. Показывает {(100 + r.speedoError).toFixed(1)} км/ч
          вместо 100 км/ч.{" "}
          {Math.abs(r.speedoError) <= 3 ? "В пределах допустимого." : " Может исказить восприятие скорости."}
        </p>
        <p>
          <b>Смещение внутреннего края:</b> {r.innerDiff.toFixed(1)} мм. Влияет на близость к подвеске.{" "}
          {Math.abs(r.innerDiff) <= 5 ? "Допустимо." : "Может задевать элементы подвески."}
        </p>
        <p>
          <b>Смещение внешнего края:</b> {r.outerDiff.toFixed(1)} мм. Влияет на внешний вид и выступание диска.{" "}
          {Math.abs(r.outerDiff) <= 10 ? "Допустимо." : "Может выйти за пределы крыла."}
        </p>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3"
      style={{
        backgroundImage: "url('/fon.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
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
        className={`${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } transform transition-all duration-700 ease-out
        w-full max-w-3xl p-6 rounded-2xl shadow-lg relative border text-center`}
        style={
          theme === "light"
            ? { backgroundColor: "#dce7f5", color: "#028cff" }
            : { backgroundColor: "rgba(40,60,80,0.6)", color: "#028cff" }
        }
      >
        {/* Назад */}
        <div className="absolute top-4 left-4">
          <Link to="/" className="font-semibold hover:underline" style={{ color: "#028cff" }}>
            ← Назад
          </Link>
        </div>

        {/* Тема */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-2 rounded-full ${theme === "dark" ? "bg-orange-500" : "bg-blue-900"}`}
          >
            {theme === "dark" ? <Sun size={20} color="white" /> : <Moon size={20} color="white" />}
          </button>
        </div>

        {/* Лого */}
        <div className="flex justify-center">
          <img src="/logo.svg" alt="Логотип" className="w-full max-w-[300px] h-auto" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-3">Калькулятор шин и дисков</h1>
        <p className="mb-4 text-sm text-center max-w-xl mx-auto">
          Укажите параметры старой и новой шины, а также дисков. Мы рассчитаем разницу в диаметре, клиренсе,
          показаниях спидометра и смещение колеса при замене диска.
        </p>

        {/* Ввод */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <h3 className="font-semibold mb-2">Старая комплектация</h3>
            {renderInput({ keyName: "oldTire", label: "Шина (295/80R22.5 или 11R22.5)", value: oldTire, setValue: setOldTire })}
            {renderInput({ keyName: "oldWheelWidth", label: "Диск (ширина, дюймы)", value: oldWheelWidth, setValue: setOldWheelWidth })}
            {renderInput({ keyName: "oldWheelET", label: "Диск (ET, мм)", value: oldWheelET, setValue: setOldWheelET })}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Новая комплектация</h3>
            {renderInput({ keyName: "newTire", label: "Шина (295/80R22.5 или 11R22.5)", value: newTire, setValue: setNewTire })}
            {renderInput({ keyName: "newWheelWidth", label: "Диск (ширина, дюймы)", value: newWheelWidth, setValue: setNewWheelWidth })}
            {renderInput({ keyName: "newWheelET", label: "Диск (ET, мм)", value: newWheelET, setValue: setNewWheelET })}
          </div>
        </div>

        <button
          onClick={calc}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold"
        >
          Рассчитать
        </button>

        {/* Лоадер */}
        {loading && (
          <div ref={loaderRef} className="flex justify-center mt-6">
            {showSpinner && (
              <div className="flex items-center gap-4">
                <img src="/tire.png" alt="Загрузка" className="w-20 sm:w-28 animate-smooth-spin" />
                <p className="text-lg">Идёт расчёт…</p>
              </div>
            )}
          </div>
        )}

        {/* Результаты */}
        {results && !loading && (
          <div
            ref={resultsRef}
            className="mt-6 space-y-6 bg-white p-4 rounded-2xl shadow-lg text-center mx-auto"
            style={{ color: "#028cff", maxWidth: "100%" }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-3">Сравнение шин и дисков</h2>
            <table className="border-collapse border border-gray-300 text-center w-full text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Параметр</th>
                  <th className="border px-2 py-1">Старая</th>
                  <th className="border px-2 py-1">Новая</th>
                  <th className="border px-2 py-1">Разница</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">Диаметр, мм</td>
                  <td className="border px-2 py-1">{results.oldParams.diameter.toFixed(1)}</td>
                  <td className="border px-2 py-1">{results.newParams.diameter.toFixed(1)}</td>
                  <td className={`border px-2 py-1 ${getDiffClass(results.percent)}`}>
                    {results.diff.toFixed(1)} мм ({results.percent.toFixed(2)}%)
                  </td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Окружность, мм</td>
                  <td className="border px-2 py-1">{results.oldParams.circumference.toFixed(1)}</td>
                  <td className="border px-2 py-1">{results.newParams.circumference.toFixed(1)}</td>
                  <td className={`border px-2 py-1 ${getDiffClass(results.speedoError)}`}>
                    {(results.newParams.circumference - results.oldParams.circumference).toFixed(1)} мм
                  </td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Клиренс, мм</td>
                  <td className="border px-2 py-1">{results.oldParams.clearance.toFixed(1)}</td>
                  <td className="border px-2 py-1">{results.newParams.clearance.toFixed(1)}</td>
                  <td className={`border px-2 py-1 ${getDiffClass(results.clearanceDiff)}`}>
                    {results.clearanceDiff.toFixed(1)} мм
                  </td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Спидометр (100 км/ч)</td>
                  <td className="border px-2 py-1">100 км/ч</td>
                  <td className="border px-2 py-1">{(100 + results.speedoError).toFixed(1)} км/ч</td>
                  <td className={`border px-2 py-1 ${getDiffClass(results.speedoError)}`}>
                    {results.speedoError.toFixed(2)}%
                  </td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Смещение внутреннего края</td>
                  <td className="border px-2 py-1">{results.innerOld.toFixed(1)}</td>
                  <td className="border px-2 py-1">{results.innerNew.toFixed(1)}</td>
                  <td className={`border px-2 py-1 ${getDiffClass(results.innerDiff)}`}>
                    {results.innerDiff.toFixed(1)} мм
                  </td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Смещение внешнего края</td>
                  <td className="border px-2 py-1">{results.outerOld.toFixed(1)}</td>
                  <td className="border px-2 py-1">{results.outerNew.toFixed(1)}</td>
                  <td className={`border px-2 py-1 ${getDiffClass(results.outerDiff)}`}>
                    {results.outerDiff.toFixed(1)} мм
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Подробное описание */}
            {describeResults(results)}
          </div>
        )}

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

























