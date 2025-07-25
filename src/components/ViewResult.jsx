import React, { useState, useEffect } from "react";
import Menu from "../menu/menu";
import UserMenu from "../users/usermenu/usermenu";
import axios from "axios";
import { API_URL } from "../../Api_Request";
import { generatePDF } from "./pdfDocument";
import Swal from "sweetalert2";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { resultsheet } from "../../redux/actions/resultSheetAction";
import { getInterviewResultSheet } from "../../redux/actions/InterviewAction";
import {
  adduserfeedback,
  addFreeFormFeedback,
} from "../../redux/actions/feedbackAction";
import loader from ".././805.gif";
import { CircularProgress, Card, CardMedia, Typography } from "@mui/material";
import DialogModal from "../reusableComponents/Modal/DialogModal";
import { FeedbackSharp } from "@material-ui/icons";
import InterviewMenu from "../users/InterviewMenu/interviewMenu";

const ViewResult = (props) => {
  const [state, setState] = useState({
    isLoaded: false,
    data: [],
    userInfo: null,
    len: "",
    level: "",
    feedBack: "",
    saveFeedback: -1,
    secondfeed: -1,
    filterData: [],
    userName: "",
    userId: "",
    iduser: props?.location?.state?.userId,
    idtest: props?.location?.state?.testId,
    topics: props?.location?.state?.topics
      ? props?.location?.state?.topics?.split(",")
      : null,
    correct: "",
    openImagePopup: false,
    image: "",
    interview: props?.location?.state?.interview,
    totalGradable: 0,
  });

  useEffect(() => {
    const params = {
      iduser: state.iduser,
      idtest: state.idtest,
    };

    if (state.interview) {
      props.getInterviewResultSheet(params);
    } else {
      props.resultsheet(params);
    }
  }, []);

  useEffect(() => {
    if (state.interview) {
      const { interviewResultSheet } = props.InterviewResults;
      if (interviewResultSheet) {
        setState(prev => ({
          ...prev,
          data: interviewResultSheet,
          filterData: interviewResultSheet,
          userInfo: interviewResultSheet[0],
          userName: `${interviewResultSheet[0].name}`,
          userId: `${interviewResultSheet[0].user_id}`,
          len: interviewResultSheet.length,
          totalGradable: interviewResultSheet[interviewResultSheet.length - 1].totalGradable,
          correct: interviewResultSheet[interviewResultSheet.length - 1].correct,
          saveFeedback: -1,
          secondfeed: -1,
          isLoaded: true,
        }));
      }
    } else {
      const { resultSheet } = props.resultSheet;
      if (resultSheet) {
        setState(prev => ({
          ...prev,
          data: resultSheet,
          filterData: resultSheet,
          userInfo: resultSheet[0],
          userName: `${resultSheet[0].first_name} ${resultSheet[0].last_name}`,
          userId: `${resultSheet[0].user_id}`,
          len: resultSheet.length,
          totalGradable: resultSheet[resultSheet.length - 1].totalGradable,
          correct: resultSheet[resultSheet.length - 1].correct,
          saveFeedback: -1,
          secondfeed: -1,
          isLoaded: true,
        }));
      }
    }
  }, [props.resultSheet, props.InterviewResults, state.interview]);

  const handleLevel = (e, idx) => {
    const level = e.target.value;
    let { feedBack, filterData } = state;
    if (!feedBack && filterData[idx]["feedback"]) {
      feedBack = filterData[idx]["feedback"];
    }
    setState(prev => ({
      ...prev,
      feedBack,
      level,
      saveFeedback: idx,
    }));
  };

  const handleFeedback = (e, idx) => {
    const feedBack = e.target.value;
    setState(prev => ({
      ...prev,
      feedBack,
      saveFeedback: idx,
      secondfeed: idx,
    }));
  };

  const handleClear = (e, index) => {
    const { filterData } = state;
    filterData[index]["feedback"] = "";
    filterData[index]["level"] = "";
    setState(prev => ({
      ...prev,
      level: "",
      feedBack: "",
      saveFeedback: -1,
      secondfeed: -1,
      filterData,
    }));
  };

  const handleSave = (e, id, uid, idx, uchoices, questionType) => {
    e.preventDefault();
    let choices = "";
    let { level, feedBack, filterData } = state;
    if (!level && filterData[idx]["level"]) {
      level = filterData[idx]["level"];
    }
    if (level === "" || level === undefined) {
      Swal.fire({ icon: "error", text: `Select feedback level` });
    } else if (feedBack === "" || feedBack === undefined) {
      Swal.fire({ icon: "error", text: `Enter feedback` });
    } else if (!questionType) {
      choices = uchoices.split(",").map((i) => Number(i));

      const feed = {
        level: level,
        feedBack: feedBack,
        userid: uid,
        questionid: id,
        choice: choices,
      };
      props.adduserfeedback(feed);
      filterData[idx]["feedback"] = feedBack;
      filterData[idx]["level"] = level;
      setState(prev => ({
        ...prev,
        feedBack: "",
        level: "",
        saveFeedback: -1,
        secondfeed: -1,
      }));
    } else if (questionType === 3 || questionType === 4) {
      const feed = {
        level: level,
        feedBack: feedBack,
        userid: uid,
        questionid: id,
        choice: choices,
      };
      props.addFreeFormFeedback(feed);
      filterData[idx]["feedback"] = feedBack;
      filterData[idx]["level"] = level;
      setState(prev => ({
        ...prev,
        feedBack: "",
        level: "",
        saveFeedback: -1,
        secondfeed: -1,
      }));
    }
  };

  const handleFilter = (e) => {
    const userresult = e.target.value;
    if (userresult === "All Results") {
      let filterData = state.data;
      setState(prev => ({
        ...prev,
        filterData: filterData,
      }));
    } else {
      let filterData = state.data.filter((result) => {
        return result?.userResult === userresult;
      });
      setState(prev => ({
        ...prev,
        filterData: filterData || [],
      }));
    }
    let topics = document.getElementById("topics");
    if (topics) topics.selectedIndex = 0;
  };

  const handleTopic = (e) => {
    const topicName = e.target.value;
    if (topicName === "All Topics") {
      let filterData = state.data;
      setState(prev => ({
        ...prev,
        filterData: filterData,
      }));
    } else {
      let filterData = state.data.filter((result) => {
        return result.topicname === topicName;
      });
      setState(prev => ({
        ...prev,
        filterData,
      }));
    }
    let answers = document.getElementById("answers");
    answers.selectedIndex = 0;
  };

  const handleImage = (e, image) => {
    setState(prev => ({
      ...prev,
      openImagePopup: true,
      image: image,
    }));
  };

  const setOpenImagePopup = (data) => {
    setState(prev => ({
      ...prev,
      openImagePopup: data,
    }));
  };

  const handlePDFDownload = () => {
    generatePDF(state.filterData, state.userName);
  };

  const { userInfo, saveFeedback, filterData, openImagePopup, image } = state;
  const { user, isAuthenticated } = props.auth;

  return (
    <div className="min-h-screen bg-gray-50">
      {state.interview ? (
        <InterviewMenu />
      ) : (user && user.role === "user") ||
        (user && user.role === "testuser") ? null : null}
      
      {/* Loading Spinner */}
      <div
        className={`fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 ${
          state.isLoaded === false ? "block" : "hidden"
        }`}
      >
        <img src={loader} alt="Loading..." className="w-16 h-16" />
      </div>

      {/* Image Modal */}
      <DialogModal
        title="Image"
        openPopup={openImagePopup}
        setOpenPopup={() => setOpenImagePopup(false)}
      >
        <div className="w-full max-w-4xl h-screen max-h-96 overflow-auto">
          <Card>
            <CardMedia
              component="img"
              alt="questionImage"
              image={image}
              className="w-full h-auto"
            />
          </Card>
        </div>
      </DialogModal>

      {/* User Information Section */}
      <div className="container mx-auto px-4 py-6">
        {userInfo && user && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap">
                  <label className="font-semibold text-gray-700 mr-2">Name:</label>
                  <span className="text-gray-900">
                    {userInfo && userInfo.name
                      ? userInfo.name
                      : `${userInfo?.first_name?.toUpperCase()} ${userInfo?.last_name?.toUpperCase()}`}
                  </span>
                </div>
                <div className="flex flex-wrap">
                  <label className="font-semibold text-gray-700 mr-2">Email:</label>
                  <span className="text-gray-900">{userInfo.email}</span>
                </div>
                <div className="flex flex-wrap">
                  <label className="font-semibold text-gray-700 mr-2">Date:</label>
                  <span className="text-gray-900">{userInfo.insertedDate}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap">
                  <label className="font-semibold text-gray-700 mr-2">Phone Number:</label>
                  <span className="text-gray-900">{userInfo.phone}</span>
                </div>
                <div className="flex flex-wrap">
                  <label className="font-semibold text-gray-700 mr-2">Result:</label>
                  <span className="text-gray-900">
                    Gradable: <mark className="bg-yellow-200 px-1">{state.correct}/{state.totalGradable}</mark> |
                    Non-Gradable: <mark className="bg-yellow-200 px-1">{state.len - state.totalGradable}</mark> |
                    Total Questions: <mark className="bg-yellow-200 px-1">{state.len}</mark>
                  </span>
                </div>
                <div className="flex flex-wrap">
                  <label className="font-semibold text-gray-700 mr-2">Test ID:</label>
                  <span className="text-gray-900">{userInfo.test_id}</span>
                </div>
                <div className="flex flex-wrap">
                  <label className="font-semibold text-gray-700 mr-2">Test Topic:</label>
                  <span className="text-gray-900">{userInfo.topicname}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-2">
              <label className="font-semibold text-gray-700">Filter by Answer result:</label>
              <select
                id="answers"
                className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleFilter}
              >
                <option>All Results</option>
                <option>Correct</option>
                <option>Wrong</option>
                <option>Non-Gradable</option>
              </select>
            </div>
            
            {state.topics?.length > 1 && (
              <div className="flex flex-col space-y-2">
                <label className="font-semibold text-gray-700">Filter by Topics:</label>
                <select
                  id="topics"
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleTopic}
                >
                  <option>All Topics</option>
                  {state.topics.map((topic, index) => (
                    <option key={index}>{topic}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex flex-col justify-end">
              {filterData && filterData.length > 0 && (
                <button
                  onClick={handlePDFDownload}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Save this report as PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="container mx-auto px-4 pb-8">
        {filterData?.length > 0 ? (
          filterData?.map((results, idx) => (
            <div key={idx} className="bg-white shadow-lg rounded-lg mb-6 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                  <p className="text-gray-800 text-lg flex-1 mb-2 lg:mb-0 lg:mr-4">
                    {idx + 1}. {results.description}
                  </p>
                  {results.userResult === "Correct" ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {results.userResult}
                    </span>
                  ) : results.userResult === "Wrong" ? (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                      {results.userResult}
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                      {results.userResult}
                    </span>
                  )}
                </div>

                {/* Image/Audio/Video handling */}
                {((results?.questiontype_id === 4 || results?.questiontype_id === 3) && results?.image_location) && (
                  <button
                    className="text-blue-500 hover:text-blue-700 underline mb-4"
                    onClick={(e) => handleImage(e, results?.image_location)}
                  >
                    View Image
                  </button>
                )}

                {results?.questiontype_id === 4 && results?.audio_location && (
                  <div className="mb-4">
                    <audio src={results?.audio_location} controls className="w-full max-w-md" />
                  </div>
                )}

                {results?.questiontype_id === 5 && results?.video_location && (
                  <div className="mb-4">
                    <video
                      src={results?.video_location}
                      controls
                      className="w-full max-w-xs sm:max-w-sm"
                    />
                  </div>
                )}

                {/* Answer sections based on question type */}
                {results?.questiontype_id === 3 ? (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">User Answer:</h4>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                      rows="3"
                      value={results.user_query || "Not Attempted"}
                      disabled
                    />
                  </div>
                ) : results?.questiontype_id === 4 ? (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">User Answer:</h4>
                    {results?.answeredAudio && (
                      <audio src={results?.answeredAudio} controls className="w-full max-w-md mb-2" />
                    )}
                    {results.user_query && (
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                        rows="3"
                        value={results.user_query}
                        disabled
                      />
                    )}
                  </div>
                ) : results.questiontype_id === 5 ? (
                  <div className="mb-4 space-y-4">
                    {results?.answeredAudio && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">User Audio:</h4>
                        <audio src={results?.answeredAudio} controls className="w-full max-w-md" />
                      </div>
                    )}
                    {results?.answeredVideo && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">User Video:</h4>
                        <video
                          src={results?.answeredVideo}
                          controls
                          className="w-full max-w-xs sm:max-w-sm"
                        />
                      </div>
                    )}
                    {results.user_query && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">User Answer:</h4>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                          rows="3"
                          value={results.user_query}
                          disabled
                        />
                      </div>
                    )}
                  </div>
                ) : results?.questiontype_id === 7 ? (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">User Answer:</h4>
                    {results?.userFile ? (
                      <Typography variant="h7" className="text-blue-500 hover:text-blue-700">
                        <a href={results?.userFile} className="underline">Download File</a>
                      </Typography>
                    ) : (
                      <Typography variant="h7" className="text-red-500">
                        No Files are uploaded
                      </Typography>
                    )}
                    {results.user_query && (
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 mt-2"
                        rows="3"
                        value={results.user_query}
                        disabled
                      />
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    {/* Multiple choice options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {results.choice_name?.map((choice, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded border">
                          {index + 1}. {choice}
                        </div>
                      ))}
                    </div>
                    
                    {/* Actual Answer */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Actual Answer:</h4>
                      {results.actual_answer?.map((ans, idx) => (
                        <div key={idx} className="text-green-600 font-semibold ml-4">
                          {ans}
                        </div>
                      ))}
                    </div>
                    
                    {/* User Answer */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">User Answer:</h4>
                      {results.user_answer?.map((uans, index) => (
                        <div
                          key={index}
                          className={`ml-4 font-semibold ${
                            results.actual_answer_id === results.user_answer_id
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {uans}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Section */}
                {(((results?.questiontype_id === 4) ||
                  (results?.questiontype_id === 3) ||
                  results.userResult === "Wrong")) && (
                  <div className="border-t pt-4">
                    <form
                      onSubmit={(e) =>
                        handleSave(
                          e,
                          results.question_id,
                          results.user_id,
                          idx,
                          results.user_answer_id,
                          results?.questiontype_id
                        )
                      }
                    >
                      {((user && (user.role === "admin" || user.role === "mentor" || user.role === "Super Admin" || user.role === "Customer Admin")) ||
                        results.feedback) && (
                        <h4 className="font-semibold text-gray-700 mb-3">Mentor Feedback:</h4>
                      )}

                      {/* Feedback Level Radio Buttons */}
                      {(user && (user.role === "admin" || user.role === "mentor" || user.role === "Super Admin" || user.role === "Customer Admin")) ||
                        results.feedback ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          <label className="flex items-center px-3 py-2 bg-orange-100 text-orange-800 rounded-lg cursor-pointer hover:bg-orange-200">
                            <input
                              type="radio"
                              name={`level-${idx}`}
                              value="Ok"
                              onChange={(e) => handleLevel(e, idx)}
                              defaultChecked={results.level === "Ok"}
                              className="mr-2"
                              disabled={!(user && (user.role === "admin" || user.role === "mentor" || user.role === "Super Admin" || user.role === "Customer Admin"))}
                            />
                            Ok
                          </label>
                          <label className="flex items-center px-3 py-2 bg-orange-200 text-orange-900 rounded-lg cursor-pointer hover:bg-orange-300">
                            <input
                              type="radio"
                              name={`level-${idx}`}
                              value="Bad"
                              onChange={(e) => handleLevel(e, idx)}
                              defaultChecked={results.level === "Bad"}
                              className="mr-2"
                              disabled={!(user && (user.role === "admin" || user.role === "mentor" || user.role === "Super Admin" || user.role === "Customer Admin"))}
                            />
                            Bad
                          </label>
                          <label className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg cursor-pointer hover:bg-red-200">
                            <input
                              type="radio"
                              name={`level-${idx}`}
                              value="Conceptually/Logically"
                              onChange={(e) => handleLevel(e, idx)}
                              defaultChecked={results.level === "Conceptually/Logically"}
                              className="mr-2"
                              disabled={!(user && (user.role === "admin" || user.role === "mentor" || user.role === "Super Admin" || user.role === "Customer Admin"))}
                            />
                            Conceptually/Logically
                          </label>
                        </div>
                      ) : null}

                      {/* Feedback Textarea */}
                      <div className="mb-4">
                        {(user && (user.role === "admin" || user.role === "mentor" || user.role === "Super Admin" || user.role === "Customer Admin")) ? (
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Enter Feedback"
                            value={saveFeedback === idx ? state.feedBack : results.feedback || ""}
                            onChange={(e) => handleFeedback(e, idx)}
                          />
                        ) : results.feedback ? (
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                            rows="3"
                            value={results.feedback}
                            disabled
                          />
                        ) : null}
                      </div>

                      {/* Save Button */}
                      {(user && (user.role === "admin" || user.role === "mentor" || user.role === "Super Admin" || user.role === "Customer Admin")) && (
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={state.saveFeedback !== idx}
                            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                              state.saveFeedback !== idx
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            }`}
                          >
                            {results.feedback ? "Edit" : "Save"}
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-red-600 font-bold text-lg">
              No Records found!!! Please select All Results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  resultSheet: state.resultSheet,
  InterviewResults: state.InterviewResults,
});

const mapDispatchToProps = {
  resultsheet,
  adduserfeedback,
  addFreeFormFeedback,
  getInterviewResultSheet,
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewResult);
