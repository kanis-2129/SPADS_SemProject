// Inga auth-ah import panni export pannanum
import { db, auth } from "../teachers/firebase"; 
import { collection, query, where, getDocs } from "firebase/firestore";

// Idhu dhaan mukkiyam: db and auth-ah thirumba inge irundhu export pannanum
// Appo dhaan unga HM components-la error varama irukkum
export { db, auth }; 

export const getHighSchoolData = async (grade) => {
  try {
    const studentsRef = collection(db, "students_marks");
    const formattedGrade = grade.includes("th") ? grade : `${grade}th`;

    const q = query(studentsRef, where("className", "==", formattedGrade));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return data;
  } catch (error) {
    console.error("Firebase Error:", error);
    return [];
  }
};

export const processSubjectWiseStats = (data) => {
  const subjects = ["Tamil", "English", "Maths", "Science", "Social"];
  return subjects.map((sub) => {
    const marks = data.map((s) => Number(s[sub] || 0));
    const toppers = marks.filter((m) => m >= 75).length;
    const average = marks.filter((m) => m >= 50 && m < 75).length;
    const bottom = marks.filter((m) => m < 50).length;

    return {
      subject: sub,
      Toppers: toppers,
      Average: average,
      Bottom: bottom,
    };
  });
};