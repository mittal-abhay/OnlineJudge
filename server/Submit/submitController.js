import Submission from "../models/Submission.js";
import Testcase from "../models/Testcase.js";
import User from "../models/User.js";
import  generateFile  from "../generateFile.mjs";
import { executeCheck } from "./SubmitFunctions.js";

const storeSubmission = async (
  prob_id,
  code_ref,
  language,
  verdict,
  comment,
  user_id,
  execution_time,
  casespassed = 0
) => {
  const submission = await Submission.create({
    problem_id: prob_id,
    code_ref: code_ref,
    language: language,
    verdict: verdict,
    comment: comment,
    user_id: user_id,
    execution_time:execution_time,
    casespassed: casespassed,
  });
  return submission;
};


export const submission = async (req, res) => {
  const { prob_id, lang = "cpp", code, user_id } = req.body;
  if (!code) {
    return res.status(400).send({
      success: false,
      message: "Code is Missing",
      error: { status: 4 }, //E4
    });
  }

  const filepath = await generateFile(lang, code);

  const testcases = await Testcase.find({ problem_id: prob_id });
  
  try {
    const { casespassed, exeTime } = await executeCheck(
      filepath,
      lang,
      testcases
    );
    console.log(exeTime);
    const submission = await storeSubmission(
      prob_id,
      filepath,
      lang,
      true,
      "ALL PASSED",
      user_id,
      exeTime,
      casespassed
    );
    //increase problems Solved by user
    const user = await User.findById(user_id);
    user.problemsSolved += 1;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "[Successful]",
      submission,
    });
  } catch (err) {
    if (err.status == 0) {
      const submission = await storeSubmission(
        prob_id,
        filepath,
        lang,
        false,
        err.error.message,
        user_id,
        0,
        err.error.casespassed
      );
      return res.status(400).send({
        success: false,
        message: "TLE",
        error: err,
        submission,
      });
    }
    if (err.status == 1) {
      const submission = await storeSubmission(
        prob_id,
        filepath,
        lang,
        false,
        "Compilation Error",
        user_id,
        0,
        0
      );
      return res.status(400).send({
        success: false,
        message: "Compilation Failed",
        error: err,
        submission,
      });
    }
    if (err.status == 2) {
      const submission = await storeSubmission(
        prob_id,
        filepath,
        lang,
        false,
        err.error.message,
        user_id,
        0,
        err.error.casespassed
      );
      return res.status(400).send({
        success: false,
        message: "Test Case Failed",
        error: err,
        submission,
      });
    }
    return res.status(500).send({
      success: false,
      message: "[Internal Server Error]",
      error: err.message,
    });
  }
};