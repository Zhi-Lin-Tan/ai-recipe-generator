import { useState } from "react";
import type { FormEvent } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

// 初始化 Amplify
Amplify.configure(outputs);
const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

function App() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(""); // 清除舊錯誤
    setResult(""); // 清除舊結果

    try {
      const formData = new FormData(event.currentTarget);
      const ingredients = formData.get("ingredients")?.toString().trim() || "";

      // 檢查輸入是否為空
      if (!ingredients) {
        alert("⚠️ Please enter at least one ingredient!");
        setLoading(false);
        return;
      }

      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients: [ingredients],
      });

      if (!errors) {
        setResult(data?.body || "⚠️ No data returned.");
      } else {
        console.error(errors);
        setErrorMsg("⚠️ Failed to generate recipe. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(`⚠️ An error occurred: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* 頁面標題 */}
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Simply type a few ingredients using the format ingredient1,
          ingredient2, etc., and Recipe AI will generate an all-new recipe on
          demand...
        </p>
      </div>

      {/* 表單輸入 */}
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Ingredient1, Ingredient2, Ingredient3,...etc"
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>

      {/* 結果區塊 */}
      <div className="result-container">
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : errorMsg ? (
          <p className="error-message">{errorMsg}</p>
        ) : (
          result && <pre className="result">{result}</pre>
        )}
      </div>
    </div>
  );
}

export default App;
