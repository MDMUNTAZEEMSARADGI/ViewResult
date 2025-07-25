import React, { Component } from "react";
import Menu from "../menu/menu";
import UserMenu from "../users/usermenu/usermenu";
import axios from "axios";
import { API_URL } from "../../Api_Request";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PdfDocument } from "./pdfDocument";
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

class ViewResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      iduser: this.props?.location?.state?.userId,
      idtest: this.props?.location?.state?.testId,
      topics: this.props?.location?.state?.topics
        ? this.props?.location?.state?.topics?.split(",")
        : null,
      correct: "",
      openImagePopup: false,
      image: "",
      interview: this.props?.location?.state?.interview,
    };
  }

  componentDidMount() {
    const params = {
      iduser: this.state.iduser,
      idtest: this.state.idtest,
    };

    // console.log(params);
    if (this.state.interview) {
      this.props.getInterviewResultSheet(params);
    } else this.props.resultsheet(params);
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps.resultSheet.resultSheet)
    // InterviewResults
    if (this.state.interview) {
      // console.log(nextProps.InterviewResults?.interviewResultSheet)
      const { interviewResultSheet } = nextProps.InterviewResults;
      if (interviewResultSheet) {
        this.setState({
          data: interviewResultSheet,
          filterData: interviewResultSheet,
          userInfo: interviewResultSheet[0],
          userName: `${interviewResultSheet[0].name}`,
          userId: `${interviewResultSheet[0].user_id}`,
          len: interviewResultSheet.length,
          totalGradable:
            interviewResultSheet[interviewResultSheet.length - 1].totalGradable,
          correct:
            interviewResultSheet[interviewResultSheet.length - 1].correct,
          saveFeedback: -1,
          secondfeed: -1,
          isLoaded: true,
        });
      }
    } else {
      const { resultSheet } = nextProps.resultSheet;
      if (resultSheet) {
        this.setState({
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
        });
      }
    }
  }

  handleLevel = (e, idx) => {
    this.state.level = e.target.value;
    let { feedBack, filterData } = this.state;
    if (!feedBack && filterData[idx]["feedback"]) {
      feedBack = filterData[idx]["feedback"];
    }
    this.setState({
      feedBack,
      level: e.target.value,
      saveFeedback: idx,
    });
    // console.log(this.state.level)
  };

  handleFeedback = (e, idx) => {
    this.state.feedBack = e.target.value;
    this.state.saveFeedback = idx;
    this.setState({
      feedBack: e.target.value,
      saveFeedback: idx,
      secondfeed: idx,
    });
    // console.log(this.state.feedBack)
    // console.log(this.state.saveFeedback)
  };

  handleClear = (e, index) => {
    const { filterData } = this.state;
    filterData[index]["feedback"] = "";
    filterData[index]["level"] = "";
    this.setState({
      level: "",
      feedBack: "",
      saveFeedback: -1,
      secondfeed: -1,
      filterData,
    });
    // this.state.level = '',
    // this.state.feedBack = ''
  };

  //Add feedback
  handleSave = (e, id, uid, idx, uchoices, questionType) => {
    e.preventDefault();
    let choices = "";
    let { level, feedBack, filterData } = this.state;
    if (!level && filterData[idx]["level"]) {
      level = filterData[idx]["level"];
    } else {
      level = level;
    }
    if (level === "" || level === undefined) {
      Swal.fire({ icon: "error", text: `Select feedback level` });
      // alert("Select feedback level")
    } else if (feedBack === "" || feedBack === undefined) {
      Swal.fire({ icon: "error", text: `Enter feedback` });
      // alert("Enter feedback")
    } else if (!questionType) {
      choices = uchoices.split(",").map((i) => Number(i));

      const feed = {
        level: level,
        feedBack: feedBack,
        userid: uid,
        questionid: id,
        choice: choices,
      };
      this.props.adduserfeedback(feed);
      filterData[idx]["feedback"] = feedBack;
      filterData[idx]["level"] = level;
      this.setState({
        feedBack: "",
        level: "",
        saveFeedback: -1,
        secondfeed: -1,
      });
    } else if (questionType === 3 || questionType === 4) {
      const feed = {
        level: level,
        feedBack: feedBack,
        userid: uid,
        questionid: id,
        choice: choices,
      };
      this.props.addFreeFormFeedback(feed);
      filterData[idx]["feedback"] = feedBack;
      filterData[idx]["level"] = level;
      this.setState({
        feedBack: "",
        level: "",
        saveFeedback: -1,
        secondfeed: -1,
      });
    }
  };

  //Filter by correct/wrong answers
  handleFilter = (e) => {
    // console.log(e.target.value);
    const userresult = e.target.value;
    if (userresult === "All Results") {
      let filterData = this.state.data;
      this.setState({
        filterData: filterData,
      });
    } else {
      let filterData = this.state.data.filter((result) => {
        return result?.userResult === userresult;
      });
      //   console.log(this.state.filterData)
      this.setState({
        filterData: filterData || [],
      });
    }
    let topics = document.getElementById("topics");
    if (topics) topics.selectedIndex = 0;
  };

  //Filter by Topics
  handleTopic = (e) => {
    // console.log(e.target.value);
    const topicName = e.target.value;
    if (topicName === "All Topics") {
      let filterData = this.state.data;
      this.setState({
        filterData: filterData,
      });
    } else {
      let filterData = this.state.data.filter((result) => {
        return result.topicname === topicName;
      });
      //   console.log(this.state.filterData)
      this.setState({
        filterData,
      });
    }
    let answers = document.getElementById("answers");
    answers.selectedIndex = 0;
  };

  handleImage = (e, image) => {
    // console.log(image);
    this.setState({
      openImagePopup: true,
      image: image,
    });
  };

  setopenImagePopup = (data) => {
    this.setState({
      openImagePopup: data,
    });
  };

  //Save as Pdf

  savePDF = (e, id) => {
    const getPDF = (id) => {
      return axios.get(
        `${API_URL}/generatepdf/?iduser=${this.state.iduser}&idtest=${this.state.idtest}`,
        {
          responseType: "arraybuffer",
          headers: {
            Accept: "application/pdf",
          },
        }
      );
    };

    return getPDF(id) // API call
      .then((response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${this.state.userName}.pdf`;
        link.click();
      })
      .catch(function (err) {
        console.log("Error", err);
      });
  };

  render() {
    const { userInfo, saveFeedback, filterData, openImagePopup, image } =
      this.state;
    const { user, isAuthenticated } = this.props.auth;
    // console.log("this.props.location",this.props.location)

    // console.log("userInfo",userInfo)

    return (
      <div>
        {
          this.state.interview ? (
            <InterviewMenu />
          ) : (user && user.role === "user") ||
            (user && user.role === "testuser") ? null : null // <UserMenu />
        }
        <div
          className="image-container"
          style={{ display: this.state.isLoaded === false ? "block" : "none" }}
        >
          <p className="image-holder">
            <img src={loader} alt="" />
          </p>
        </div>
        <DialogModal
          title="Image"
          openPopup={openImagePopup}
          setOpenPopup={() => this.setopenImagePopup()}
        >
          <div style={{ width: "1000px", height: "100vh" }}>
            <Card>
              <CardMedia
                component="img"
                alt="questionImage"
                // height="140"
                image={image}
              />
            </Card>
          </div>
        </DialogModal>
        <div className="container mar">
          {userInfo && user && (
            <div
              id="details"
              className="row bg-white shadow-sm font-weight-bold box"
            >
              <div className="col-sm-6 p-3">
                <div>
                  <label className="mr-1">Name : </label>
                  {userInfo && userInfo.name
                    ? userInfo.name
                    : // {" " +
                      //   userInfo?.first_name?.toUpperCase() +
                      //   " " +
                      //   userInfo?.last_name?.toUpperCase()
                      `${userInfo?.first_name?.toUpperCase()} ${userInfo?.last_name?.toUpperCase()}`}
                </div>
                <div>
                  <label className="mr-1">Email : </label>
                  {" " + userInfo.email}
                </div>
                <div>
                  <label className="mr-1">Date : </label>
                  {userInfo.insertedDate}
                </div>
              </div>
              <div className="col-sm-6 p-3">
                <div>
                  <label className="mr-1">Phone Number : </label>
                  {" " + userInfo.phone}
                </div>
                <div>
                  <label className="mr-1">
                    Result: Gradable:{" "}
                    <mark>
                      {this.state.correct}/{this.state.totalGradable}
                    </mark>{" "}
                    | Non-Gradable:{" "}
                    <mark>{this.state.len - this.state.totalGradable}</mark> |
                    Total Questions: <mark>{this.state.len}</mark>
                  </label>
                  {/* {this.state.correct} / {this.state.len} */}
                </div>
                <div>
                  <label className="mr-1">Test ID : </label>
                  {userInfo.test_id}
                </div>
                <div>
                  <label className="mr-1">Test Topic : </label>
                  {userInfo.topicname}
                </div>
              </div>
            </div>
          )}
        </div>

        <div id="filter" className="container">
          <div className="row">
            <div className="col-sm-4 p-3">
              <b>Filter by Answer result : </b>
              <select
                id="answers"
                className="btn btn-primary ml-3"
                onChange={(e) => this.handleFilter(e)}
              >
                <option>All Results</option>
                <option>Correct</option>
                <option>Wrong</option>
                <option>Non-Gradable</option>
              </select>
            </div>
            <div className="col-sm-4 p-3">
              {this.state.topics?.length > 1 ? (
                <React.Fragment>
                  <b>Filter by Topics : </b>
                  <select
                    id="topics"
                    className="btn btn-primary ml-3"
                    onChange={(e) => this.handleTopic(e)}
                  >
                    <option>All Topics</option>
                    {this.state.topics.map((topic) => (
                      <option>{topic}</option>
                    ))}
                  </select>
                </React.Fragment>
              ) : null}
            </div>
            <div className="col-sm-4 p-3 mt-2">
              {filterData && filterData.length <= 0 ? null : (
                <PDFDownloadLink
                  document={<PdfDocument data={this.state.filterData} />}
                  fileName={`${this.state.userName}.pdf`}
                  style={{
                    textAlign: "center",
                    padding: "10px",
                    color: "#fff",
                    backgroundColor: "#5cb85c",
                    border: "1px solid transparent",
                    borderColor: "#4cae4c",
                    borderRadius: 4,
                    fontWeight: 400,
                    height: "100%",
                  }}
                >
                  {({ blob, url, loading, error }) => {
                    console.log(error);
                    return loading && this.state.filterData.length > 0
                      ? "Loading document..."
                      : "Save this report as Pdf";
                  }}
                </PDFDownloadLink>
              )}
              {/* <PDFDownloadLink
                document={<PdfDocument data={this.state.filterData} />}
                fileName={`${this.state.userName}.pdf`}
                style={{
                  textAlign: "center",
                  padding: "10px",
                  color: "#fff",
                  backgroundColor: "#5cb85c",
                  border: "1px solid transparent",
                  borderColor: "#4cae4c",
                  borderRadius: 4,
                  fontWeight: 400,
                }}
              >
                {({ blob, url, loading, error }) =>
                  loading && this.state.filterData.length > 0
                    ? "Loading document..."
                    : "Save this report as Pdf"
                }
              </PDFDownloadLink> */}
              {/* <button id="print-button" className ="btn btn-success mx-auto"
                            onClick={(e) => this.savePDF(e, this.state.userId)}>Save this report as PDF</button> */}
            </div>
          </div>
        </div>

        <div className="mb-5">
          {this.state.filterData?.length > 0 ? (
            this.state.filterData?.map((results, idx) => {
              return (
                <div className="container" key={idx}>
                  <div className="row box">
                    <div className="col-sm-12">
                      <div className="pl-5 shadow-sm p-4 my-2 bg-white">
                        <p>
                          {idx + 1}.{results.description}
                          {/* {
                                           (results.actual_answer_id === results.user_answer_id) ?
                                            <span style={{color: "green", float:"right"}}><b>{this.state.check = "Correct"}</b> </span>
                                            :
                                            <span style={{color: "red", float:"right"}}> <b>{this.state.check = "Wrong"}</b>
                                            </span>
                                        }  */}
                          {results.userResult === "Correct" ? (
                            <span style={{ color: "green", float: "right" }}>
                              <b>{results.userResult}</b>{" "}
                            </span>
                          ) : results.userResult === "Wrong" ? (
                            <span style={{ color: "red", float: "right" }}>
                              <b>{results.userResult}</b>{" "}
                            </span>
                          ) : (
                            <span style={{ color: "orange", float: "right" }}>
                              {" "}
                              <b>{results.userResult}</b>
                            </span>
                          )}
                        </p>
                        {(results?.questiontype_id &&
                          results.questiontype_id === 4 &&
                          results?.image_location) ||
                        (results?.questiontype_id &&
                          results.questiontype_id === 3 &&
                          results?.image_location) ? (
                          <p
                            className="viewImage ml-3"
                            onClick={(e) =>
                              this.handleImage(e, results?.image_location)
                            }
                          >
                            View Image
                          </p>
                        ) : null}
                        {results?.questiontype_id &&
                        results.questiontype_id === 4 &&
                        results?.audio_location ? (
                          <audio src={results?.audio_location} controls />
                        ) : null}
                        {results?.questiontype_id &&
                        results.questiontype_id === 5 &&
                        results?.video_location ? (
                          <video
                            style={{ width: "200px" }}
                            src={results?.video_location}
                            controls
                          />
                        ) : null}
                        {
                          // (results?.questiontype_id &&
                          //   results.questiontype_id === 4) ||
                          results?.questiontype_id &&
                          results.questiontype_id === 3 ? (
                            <div className="row">
                              <div className="col-sm-12 mt-1">
                                <b>User Answer:</b>
                              </div>
                              <textarea
                                className="form-control ml-3 mt-2"
                                id="text"
                                rows="2"
                                placeholder="User Answer"
                                key={idx}
                                value={
                                  results.user_query
                                    ? results.user_query
                                    : "Not Attempted"
                                }
                                cols="100"
                                disabled
                              />
                            </div>
                          ) : results?.questiontype_id &&
                            results.questiontype_id === 4 ? (
                            <div className="row">
                              <div className="col-sm-12 mt-1">
                                <b>User Answer:</b>
                              </div>

                              {results?.questiontype_id &&
                              results.questiontype_id === 4 &&
                              results?.answeredAudio ? (
                                <audio src={results?.answeredAudio} controls />
                              ) : null}

                              {/* condition */}
                              <br />
                              {results.user_query ? (
                                <textarea
                                  className="form-control ml-3 mt-2"
                                  id="text"
                                  rows="2"
                                  placeholder="User Answer"
                                  key={idx}
                                  value={results.user_query}
                                  cols="100"
                                  disabled
                                />
                              ) : null}
                            </div>
                          ) : results.questiontype_id === 5 ? (
                            <div className="row">
                              {results?.answeredAudio ? (
                                <div className="col-sm-12 mt-1">
                                  <b>
                                    User Audio:
                                    <audio
                                      src={results?.answeredAudio}
                                      controls
                                    />
                                  </b>
                                </div>
                              ) : null}
                              {results?.answeredVideo ? (
                                <div className="col-sm-12 mt-1">
                                  <p>
                                    <b>User Video:</b>
                                  </p>
                                  <video
                                    style={{
                                      width: "200px",
                                      marginLeft: "50px",
                                    }}
                                    src={results?.answeredVideo}
                                    controls
                                  />
                                </div>
                              ) : null}

                              {/* condition */}
                              <br />
                              {results.user_query ? (
                                <div className="col-sm-12 mt-1">
                                  <b>
                                    User Answer:
                                    <textarea
                                      className="form-control ml-3 mt-2"
                                      id="text"
                                      rows="2"
                                      placeholder="User Answer"
                                      key={idx}
                                      value={results.user_query}
                                      cols="100"
                                      disabled
                                    />
                                  </b>
                                </div>
                              ) : null}
                            </div>
                          ) : results?.questiontype_id &&
                            results.questiontype_id === 7 ? (
                            <div className="row">
                              <div className="col-sm-12 mt-1">
                                <b>User Answer:</b>
                              </div>

                              {results?.questiontype_id &&
                              results.questiontype_id === 7 &&
                              results?.userFile ? (
                                <Typography
                                  variant="h7"
                                  className="col-sm-12 mt-1"
                                >
                                  <a href={results?.userFile}>Download File</a>
                                </Typography>
                              ) : (
                                <Typography
                                  variant="h7"
                                  className="col-sm-12 mt-1"
                                  color="red"
                                >
                                  No Files are uploaded
                                </Typography>
                              )}

                              {/* condition */}
                              <br />
                              {results.user_query ? (
                                <textarea
                                  className="form-control ml-3 mt-2"
                                  id="text"
                                  rows="2"
                                  placeholder="User Answer"
                                  key={idx}
                                  value={results.user_query}
                                  cols="100"
                                  disabled
                                />
                              ) : null}
                            </div>
                          ) : (
                            <>
                              <div className="row ml-2">
                                {results.choice_name?.map((a, index) => {
                                  return (
                                    <div className="col-sm-6 p-2" key={index}>
                                      {index + 1}. {a}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="row">
                                <div className="col-sm-12">
                                  <b>Actual Answer:</b>
                                </div>
                                {results.actual_answer?.map((ans, idx) => {
                                  return (
                                    <div
                                      key={idx}
                                      className="col-sm-9 pl-5"
                                      style={{ color: "green" }}
                                    >
                                      <b>{ans}</b>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="row">
                                <div className="col-sm-12 mt-1">
                                  <b>User Answer:</b>
                                </div>
                                {results.user_answer?.map((uans, index) => {
                                  return (
                                    <div key={index} className="col-sm-9 pl-5">
                                      {results.actual_answer_id ===
                                      results.user_answer_id ? (
                                        <span style={{ color: "green" }}>
                                          {" "}
                                          <b> {uans}</b>
                                        </span>
                                      ) : (
                                        <span style={{ color: "red" }}>
                                          {" "}
                                          <b> {uans}</b>
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )
                        }
                        <div
                          className="row"
                          style={{
                            display:
                              (results?.questiontype_id &&
                                results.questiontype_id === 4) ||
                              (results?.questiontype_id &&
                                results.questiontype_id === 3) ||
                              results.userResult === "Wrong"
                                ? "block"
                                : "none",
                          }}
                        >
                          <div className="col-sm-12 mt-1">
                            <form
                              onSubmit={(e) =>
                                this.handleSave(
                                  e,
                                  results.question_id,
                                  results.user_id,
                                  idx,
                                  results.user_answer_id,
                                  results?.questiontype_id
                                )
                              }
                            >
                              {(user && user.role === "admin") ||
                              (user && user.role === "mentor") ||
                              (user && user.role === "Super Admin") ||
                              (user && user.role === "Customer Admin") ? (
                                <b>Mentor FeedBack:</b>
                              ) : results.feedback ? (
                                <b>Mentor FeedBack:</b>
                              ) : null}
                              {(user && user.role === "admin") ||
                              (user && user.role === "mentor") ||
                              (user && user.role === "Super Admin") ||
                              (user && user.role === "Customer Admin") ? (
                                <span>
                                  <span
                                    className="pr-3"
                                    style={{ backgroundColor: "orange" }}
                                  >
                                    <input
                                      className="ml-3"
                                      type="radio"
                                      name="level"
                                      value="Ok"
                                      key={idx}
                                      onChange={(e) => this.handleLevel(e, idx)}
                                      defaultChecked={
                                        results.level === "Ok" ? "Ok" : null
                                      }
                                    />{" "}
                                    Ok
                                  </span>
                                  <span
                                    className="pr-3"
                                    style={{ backgroundColor: "darkorange" }}
                                  >
                                    <input
                                      className="ml-3"
                                      type="radio"
                                      name="level"
                                      value="Bad"
                                      key={idx}
                                      onChange={(e) => this.handleLevel(e, idx)}
                                      defaultChecked={
                                        results.level === "Bad" ? "Bad" : null
                                      }
                                    />{" "}
                                    Bad
                                  </span>
                                  <span
                                    className="pr-3"
                                    style={{ backgroundColor: "red" }}
                                  >
                                    <input
                                      className="ml-3"
                                      type="radio"
                                      name="level"
                                      value="Conceptually/Logically"
                                      key={idx}
                                      onChange={(e) => this.handleLevel(e, idx)}
                                      defaultChecked={
                                        results.level ===
                                        "Conceptually/Logically"
                                          ? "Conceptually/Logically"
                                          : null
                                      }
                                    />{" "}
                                    Conceptually/Logically
                                  </span>
                                </span>
                              ) : results.feedback ? (
                                <span>
                                  <span
                                    className="pr-3"
                                    style={{
                                      backgroundColor: "orange",
                                      textAlign: "center",
                                    }}
                                  >
                                    <input
                                      className="ml-3"
                                      type="radio"
                                      name="level"
                                      value="Ok"
                                      key={idx}
                                      onChange={(e) => this.handleLevel(e, idx)}
                                      checked={
                                        results.level === "Ok"
                                          ? (this.checked = true)
                                          : (this.checked = false)
                                      }
                                    />{" "}
                                    Ok
                                  </span>
                                  <span
                                    className="pr-3"
                                    style={{ backgroundColor: "darkorange" }}
                                  >
                                    <input
                                      className="ml-3"
                                      type="radio"
                                      name="level"
                                      value="Bad"
                                      key={idx}
                                      onChange={(e) => this.handleLevel(e, idx)}
                                      checked={
                                        results.level === "Bad"
                                          ? (this.checked = true)
                                          : (this.checked = false)
                                      }
                                    />{" "}
                                    Bad
                                  </span>
                                  <span
                                    className="pr-3"
                                    style={{ backgroundColor: "red" }}
                                  >
                                    <input
                                      className="ml-3"
                                      type="radio"
                                      name="level"
                                      value="Conceptually/Logically"
                                      key={idx}
                                      onChange={(e) => this.handleLevel(e, idx)}
                                      checked={
                                        results.level ===
                                        "Conceptually/Logically"
                                          ? (this.checked = true)
                                          : (this.checked = false)
                                      }
                                    />{" "}
                                    Conceptually/Logically
                                  </span>
                                </span>
                              ) : null}
                              <div className="mt-2">
                                {(user && user.role === "admin") ||
                                (user && user.role === "mentor") ||
                                (user && user.role === "Super Admin") ||
                                (user && user.role === "Customer Admin") ? (
                                  saveFeedback === idx ? (
                                    <textarea
                                      className="form-control"
                                      id="text"
                                      rows="2"
                                      placeholder="Enter Feedback"
                                      defaultValue={results.feedback}
                                      key={idx}
                                      value={this.state.feedBack}
                                      cols="100"
                                      onChange={(e) => {
                                        this.handleFeedback(e, idx);
                                      }}
                                    />
                                  ) : (
                                    <textarea
                                      className="form-control"
                                      id="text"
                                      rows="2"
                                      placeholder="Enter Feedback"
                                      key={idx}
                                      value={results.feedback}
                                      cols="100"
                                      onChange={(e) => {
                                        this.handleFeedback(e, idx);
                                      }}
                                    />
                                  )
                                ) : results.feedback ? (
                                  <textarea
                                    className="form-control"
                                    id="text"
                                    rows="2"
                                    placeholder="Enter Feedback"
                                    key={idx}
                                    value={results.feedback}
                                    cols="100"
                                    disabled
                                    onChange={(e) => {
                                      this.handleFeedback(e, idx);
                                    }}
                                  />
                                ) : null}
                                {/* <textarea className="form-control" id="text" rows="2" placeholder="Enter Feedback"
                                            value={this.state.feedBack}  cols="100"
                                            onChange={(e) => { this.handleFeedback(e, idx) }}  /> */}
                              </div>
                              {(user && user.role === "admin") ||
                              (user && user.role === "mentor") ||
                              (user && user.role === "Super Admin") ||
                              (user && user.role === "Customer Admin") ? (
                                <div className="mt-2" id="feed-button">
                                  <div>
                                    <button
                                      type="submit"
                                      className="btn btn-primary mr-2"
                                      disabled={this.state.saveFeedback !== idx}
                                      value="save"
                                    >
                                      {results.feedback ? "Edit" : "Save"}
                                    </button>
                                  </div>
                                  {/* <button type="reset"
                                                className="btn btn-danger"
                                                value="clear" onClick={(e) => {this.handleClear(e, idx)}}>Clear</button> */}
                                </div>
                              ) : null}
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <center style={{ color: "red", fontWeight: "bold" }}>
              No Records found!!!. Please select All Results.
            </center>
          )}
        </div>
      </div>
    );
  }
}

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
