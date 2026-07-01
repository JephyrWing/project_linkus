import { useState, useEffect } from "react";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminFilters() {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchWords = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/admin/filters/findall?page=${pageNum}&size=20`);
      setWords(res.data.content); 
      setTotalPages(res.data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("데이터 조회 실패", error);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const addWord = async () => {
    if (!newWord.trim()) return;
    try {
      await getCommonApi().post("/admin/filters", { word: newWord });
      setNewWord("");
      fetchWords();
    } catch (error) {
      alert(error.response?.data?.message || "등록 중 오류가 발생했습니다.");
    }
  };

  const deleteWord = async (id) => {
    try {
      await getCommonApi().delete(`/admin/filters/${id}`);
      fetchWords(page);
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h3 className="mb-4">필터 관리</h3>
      
      <div className="filter-input-area" style={{ marginBottom: "20px" }}>
        <input 
          value={newWord} 
          onChange={(e) => setNewWord(e.target.value)} 
          placeholder="추가할 금지어를 입력하세요"
          style={{width:"300px", padding: "8px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px"}}
        />
        <button onClick={addWord} style={{ marginLeft: "10px", padding: "8px 16px", border: "1px solid #ddd", borderRadius: "5px", cursor: "pointer" }}>추가</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>금지어</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {words.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.word}</td>
              <td>
                <button onClick={() => deleteWord(item.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-container">
        <button 
          className="page-btn"
          disabled={page === 0} 
          onClick={() => fetchWords(page - 1)} 
        >
          이전
        </button>
        
        <span className="page-info">{page + 1} / {totalPages}</span>
        
        <button 
          className="page-btn"
          disabled={page >= totalPages - 1} 
          onClick={() => fetchWords(page + 1)} 
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default AdminFilters;