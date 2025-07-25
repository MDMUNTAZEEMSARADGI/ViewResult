import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (data, userName) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Add title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Test Result Report", 20, yPosition);
  yPosition += 15;

  // Add user information
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const userInfo = data[0];
  const userInfoText = [
    `Name: ${userInfo.name || `${userInfo.first_name?.toUpperCase()} ${userInfo.last_name?.toUpperCase()}`}`,
    `Email: ${userInfo.email}`,
    `Date: ${userInfo.insertedDate}`,
    `Phone Number: ${userInfo.phone}`,
    `Test ID: ${userInfo.test_id}`,
    `Test Topic: ${userInfo.topicname}`,
    `Result: ${data[data.length - 1]?.correct || 0} / ${data.length}`
  ];

  userInfoText.forEach((text, index) => {
    if (index % 2 === 0) {
      doc.text(text, 20, yPosition);
      if (userInfoText[index + 1]) {
        doc.text(userInfoText[index + 1], 110, yPosition);
      }
      yPosition += 8;
    }
  });

  yPosition += 10;

  // Add questions and answers
  data.forEach((result, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Question number and description
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const questionText = `${index + 1}. ${result.description}`;
    const splitQuestion = doc.splitTextToSize(questionText, 150);
    doc.text(splitQuestion, 20, yPosition);
    yPosition += splitQuestion.length * 5;

    // Result status
    if (result.userResult) {
      doc.setFont("helvetica", "bold");
      if (result.userResult === "Correct") {
        doc.setTextColor(0, 128, 0); // Green
      } else if (result.userResult === "Wrong") {
        doc.setTextColor(255, 0, 0); // Red
      } else {
        doc.setTextColor(255, 165, 0); // Orange
      }
      doc.text(result.userResult, 175, yPosition - splitQuestion.length * 5 + 5);
      doc.setTextColor(0, 0, 0); // Reset to black
    }

    yPosition += 5;

    // Handle different question types
    if (result.questiontype_id === 3 || result.questiontype_id === 4) {
      // Free form questions
      doc.setFont("helvetica", "bold");
      doc.text("User Answer:", 20, yPosition);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      const userAnswer = result.user_query || "Not Attempted";
      const splitAnswer = doc.splitTextToSize(userAnswer, 170);
      doc.text(splitAnswer, 20, yPosition);
      yPosition += splitAnswer.length * 5 + 5;
    } else {
      // Multiple choice questions
      if (result.choice_name && result.choice_name.length > 0) {
        doc.setFont("helvetica", "normal");
        result.choice_name.forEach((choice, choiceIndex) => {
          const choiceText = `${choiceIndex + 1}. ${choice}`;
          const splitChoice = doc.splitTextToSize(choiceText, 80);
          const xPos = choiceIndex % 2 === 0 ? 20 : 110;
          if (choiceIndex % 2 === 0 && choiceIndex > 0) yPosition += 5;
          doc.text(splitChoice, xPos, yPosition);
        });
        yPosition += 10;

        // Actual Answer
        if (result.actual_answer && result.actual_answer.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text("Actual Answer:", 20, yPosition);
          yPosition += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 128, 0); // Green
          result.actual_answer.forEach(ans => {
            doc.text(ans, 20, yPosition);
            yPosition += 5;
          });
          doc.setTextColor(0, 0, 0); // Reset to black
        }

        // User Answer
        if (result.user_answer && result.user_answer.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text("User Answer:", 20, yPosition);
          yPosition += 5;
          doc.setFont("helvetica", "normal");
          
          const isCorrect = result.actual_answer_id === result.user_answer_id;
          doc.setTextColor(isCorrect ? 0 : 255, isCorrect ? 128 : 0, 0);
          result.user_answer.forEach(uans => {
            doc.text(uans, 20, yPosition);
            yPosition += 5;
          });
          doc.setTextColor(0, 0, 0); // Reset to black
        }
      }
    }

    // Mentor Feedback
    if (result.feedback && result.feedback !== "null" && result.feedback !== "") {
      doc.setFont("helvetica", "bold");
      doc.text("Mentor Feedback:", 20, yPosition);
      yPosition += 5;

      if (result.level) {
        doc.setFont("helvetica", "normal");
        let bgColor = [255, 165, 0]; // Orange for "Ok"
        if (result.level === "Bad") bgColor = [255, 140, 0]; // Dark orange
        if (result.level === "Conceptually/Logically") bgColor = [255, 0, 0]; // Red
        
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(20, yPosition - 3, 20, 6, 'F');
        doc.text(result.level, 22, yPosition + 1);
        yPosition += 8;
      }

      doc.setFont("helvetica", "normal");
      const splitFeedback = doc.splitTextToSize(result.feedback, 170);
      doc.text(splitFeedback, 20, yPosition);
      yPosition += splitFeedback.length * 5;
    }

    yPosition += 10; // Space between questions
  });

  // Save the PDF
  doc.save(`${userName}.pdf`);
};
