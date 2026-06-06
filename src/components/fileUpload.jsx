import React, { useState } from "react";
import { X, Loader2, Plus, LayoutGrid } from "lucide-react";
import * as XLSX from "xlsx";
import {
  collection,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db, auth } from "../pages/teachers/firebase";

const UploadModal = ({ activeClass, onClose, displayYear }) => {
  const [examName, setExamName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !examName) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 1. Raw rows-ah mathi header kandu pidikkirom
        const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headerRowIndex = allRows.findIndex((row) =>
          row.some(
            (cell) =>
              String(cell).toLowerCase().includes("reg") ||
              String(cell).toLowerCase().includes("student name") ||
              String(cell).toLowerCase().includes("name"),
          ),
        );

        if (headerRowIndex === -1) {
          alert("Header (Reg No / Name) kandupikka mudiyala!");
          setLoading(false);
          return;
        }

        // 2. Data fetch and cleanup
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: headerRowIndex,
        });
        const cleanedData = jsonData.filter((row) => {
          const regValue = row["Reg. No"] || row["Reg No"] || row["Reg.no"];
          return (
            regValue &&
            !["th", "pr", "tot", "total"].includes(
              String(regValue).toLowerCase(),
            )
          );
        });

        // 3. --- FIREBASE UPLOAD LOGIC ---
        // Step A: Create Summary Record
        const summaryRef = await addDoc(collection(db, "exam_summaries"), {
          classId: activeClass.id,
          className: activeClass.className, // 👈 Add this
          section: activeClass.section,
          teacherUid: auth.currentUser.uid,
          examName: examName,
          fileName: file.name,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          createdAt: serverTimestamp(),
          prediction: "Analysis pending...", // Initial AI text
        });

        // Step B: Create Student Marks (Batch Upload for speed)
        const batch = writeBatch(db);
        cleanedData.forEach((student) => {
          const markRef = doc(collection(db, "students_marks"));
          batch.set(markRef, {
            ...student,
            summaryId: summaryRef.id, // Linking marks to summary
            classId: activeClass.id,
            className: activeClass.className, 
            section: activeClass.section,
            teacherUid: auth.currentUser.uid,
            examName: examName,
          });
        });

        await batch.commit();
        alert(
          "Success! Marks uploaded for " + cleanedData.length + " students.",
        );
        onClose(); // Close modal after success
      } catch (err) {
        console.error(err);
        alert("Upload failed: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-red-500"
        >
          <X size={24} />
        </button>
        <div className="w-16 h-16 bg-cyan-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-200">
          <LayoutGrid size={30} />
        </div>
        <h3 className="text-2xl font-black mb-2 text-slate-800">
          Upload Exam File
        </h3>
        <p className="text-slate-400 text-sm mb-6 font-bold uppercase tracking-tight italic">
          Files for {activeClass.className}-{activeClass.section}
        </p>

        <input
          type="text"
          placeholder="Exam Name (e.g. Mid Term 1)"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl mb-6 outline-none focus:border-cyan-500 font-black transition-all"
        />

        <label
          className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 cursor-pointer transition-all shadow-xl ${!examName || loading ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-cyan-600"}`}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Plus />}
          {loading ? "Processing..." : "Upload Excel"}
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={!examName || loading}
          />
        </label>
      </div>
    </div>
  );
};

export default UploadModal;
