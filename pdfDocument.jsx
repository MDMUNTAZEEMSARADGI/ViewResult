import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
// import {
//   Page,
//   Text,
//   View,
//   Document,
//   StyleSheet,
//   Image,
//   Font,
// } from "@react-pdf/renderer";
import loader from "../../images/arohaLogo.png";

// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap'
// });

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 35,
    paddingBottom: 45,
  },
  section: {
    fontSize: 11,
    display: "flex",
    fontWeight: "bolder",
    textAlign: "left",
    flexDirection: "row",
    width: "100%",
    marginLeft: 30,
    marginBottom: 5,
    // fontFamily : "Source Sans Pro"
  },
  mainsection: {
    marginTop: 7,
    paddingTop: 3,
    paddingLeft: 5,
    fontSize: 10,
    width: "90%",
    marginLeft: 30,
    border: 1,
    marginBottom: 10,
    borderColor: "silver",
    borderRadius: 3,
  },
  choicesection: {
    marginTop: 5,
    display: "flex",
    fontWeight: "bolder",
    textAlign: "left",
    flexDirection: "row",
    fontSize: 10,
    width: "100%",
    marginLeft: 10,
    flexWrap: "wrap",
  },
  choices: {
    width: "45%",
    marginBottom: 3,
  },
  description: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  rightsection: {
    width: "50%",
    float: "right",
  },
  leftsection: {
    width: "50%",
    float: "left",
    height: "100%",
  },
  correctanswers: {
    color: "green",
    marginBottom: 3,
    marginLeft: 15,
  },
  wronganswers: {
    color: "red",
    marginBottom: 3,
    marginLeft: 15,
  },
  usual: {
    marginBottom: 3,
    marginLeft: 15,
  },
  boldfont: {
    fontSize: 11,
    marginBottom: 3,
  },
  image: {
    margin: "auto",
    // height: 70,
    width: 100,
    paddingBottom: 20,
  },
  feedback: {
    marginLeft: 15,
    marginBottom: 3,
    border: 1,
    borderColor: "silver",
    width: "95%",
    paddingTop: 3,
    paddingLeft: 3,
    // height: 50,
    borderRadius: 3,
  },
});
// Create Document Component
export const PdfDocument = (props) => (
  <Document>
    {console.log("props?.data?", props?.data[0])}
    <Page size="A4" style={styles.page}>
      {props?.data?.length > 0 ? (
        <>
          <View style={styles.section}>
            <Text style={styles.leftsection}>
              Name:{" "}
              {`${props?.data[0]?.first_name?.toUpperCase()}
${props?.data[0]?.last_name?.toUpperCase()}`}
            </Text>
            <Text style={styles.rightsection}>
              Email: {`${props?.data[0]?.email}`}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.leftsection}>
              Date: {`${props.data[0].insertedDate}`}
            </Text>
            <Text style={styles.rightsection}>
              Phone Number: {`${props.data[0].phone}`}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.leftsection}>
              Test ID: {`${props.data[0].test_id}`}
            </Text>
            <Text style={styles.rightsection}>
              Result:{" "}
              {`${props.data[props.data.length - 1].correct} / ${
                props.data.length
              }`}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.leftsection}>
              Test Topic: {`${props.data[0].topicname}`}
            </Text>
          </View>
          {props?.data?.length > 0 &&
            props?.data?.map((results, index) => {
              return (
                <View key={index} style={styles.mainsection}>
                  <View style={styles.description}>
                    <Text style={{ float: "left", width: "90%" }}>
                      {index + 1}. {results.description}
                    </Text>
                    {(results?.questiontype_id &&
                      results?.questiontype_id === 4) ||
                    (results?.questiontype_id &&
                      results?.questiontype_id == 3) ? (
                      <Text></Text>
                    ) : results.userResult === "Correct" ? (
                      <Text
                        style={{
                          color: "green",
                          float: "right",
                          width: "10%",
                        }}
                      >
                        {results.userResult}
                      </Text>
                    ) : (
                      <Text
                        style={{ color: "red", float: "right", width: "10%" }}
                      >
                        {results.userResult}
                      </Text>
                    )}
                  </View>
                  {(results?.questiontype_id &&
                    results.questiontype_id === 4) ||
                  (results?.questiontype_id &&
                    results.questiontype_id === 3) ? (
                    <>
                      <Text style={styles.boldfont}>User Answer:</Text>
                      <Text style={styles.feedback}>
                        {results?.user_query
                          ? `${results?.user_query}`
                          : "Not Attempted"}
                      </Text>
                    </>
                  ) : (
                    <>
                      <View style={styles.choicesection}>
                        {results.choice_name?.map((choice, index) => {
                          return (
                            <Text style={styles.choices} key={index}>{` ${
                              index + 1
                            }. ${choice} `}</Text>
                          );
                        })}
                      </View>
                      <Text style={styles.boldfont}>Actual Answer:</Text>
                      {results.actual_answer?.map((ans, idx) => {
                        return (
                          <Text style={styles.usual} key={idx}>{`${ans}`}</Text>
                        );
                      })}
                      <Text style={styles.boldfont}>User Answer:</Text>
                      {results.user_answer?.map((uans, index) =>
                        results.actual_answer_id === results.user_answer_id ? (
                          <Text
                            style={styles.correctanswers}
                            key={index}
                          >{`${uans} `}</Text>
                        ) : (
                          <Text
                            style={styles.wronganswers}
                            key={index}
                          >{`${uans} `}</Text>
                        )
                      )}
                    </>
                  )}
                  {results.feedback === null ||
                  results.feedback === undefined ||
                  results.feedback === "null" ||
                  results.feedback === "" ? null : (
                    <>
                      <Text style={styles.boldfont}>Mentor Feedback:</Text>
                      {results.level === "Ok" ? (
                        <Text
                          style={{
                            width: "10%",
                            backgroundColor: "orange",
                            marginLeft: 15,
                            marginBottom: 3,
                            textAlign: "center",
                          }}
                        >
                          {`${results.level}`}
                        </Text>
                      ) : results.level === "Bad" ? (
                        <Text
                          style={{
                            width: "10%",
                            backgroundColor: "darkorange",
                            marginLeft: 15,
                            marginBottom: 3,
                            textAlign: "center",
                          }}
                        >
                          {`${results.level}`}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            width: "25%",
                            backgroundColor: "red",
                            marginLeft: 15,
                            marginBottom: 3,
                            textAlign: "center",
                          }}
                        >
                          {`${results.level}`}
                        </Text>
                      )}
                      <Text
                        style={styles.feedback}
                      >{`${results.feedback}`}</Text>
                    </>
                  )}
                </View>
              );
            })}
        </>
      ) : (
        <View>
          <Text></Text>
        </View>
      )}
    </Page>
  </Document>
);
