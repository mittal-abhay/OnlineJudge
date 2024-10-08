import React, { useState, useEffect } from 'react';
import Navbar from '../commons/navbar';
import { useAuth } from '../../context/AuthContext';
import avatar from "../../assets/avatar.png";
import styles from "./userProfile.module.css";
import axios from 'axios';
import { Table, Button, Modal } from 'react-bootstrap';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-c_cpp"; // or any other mode you need
import "ace-builds/src-noconflict/theme-monokai"; // dark theme
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { user, customFetch } = useAuth();
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [problemTitles, setProblemTitles] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ comment: '', code: '' });
  const [userProfile, setUserProfile] = useState({});
  const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

  useEffect (() => {
    const fetchUser = async () => {
      try {
        const res = await customFetch(`/api/users/${user._id}`, "GET");
        setUserProfile(res);
      } catch (err) {
      }
    }
  fetchUser();
  }, []);

  const seeSubmissions = async () => {
    try {
      const res = await customFetch(`/api/users/${user._id}/submissions`, "GET");
      if(res.length === 0){
        toast.error("No submissions found");
      }
      setUserSubmissions(res);
      
      const titles = await Promise.all(res.map(async (submission) => {
        const titleRes = await customFetch(`/api/problems/${submission.problem_id}`, "GET");
        return { id: submission.problem_id, title: titleRes.title };
      }));

      const titlesMap = {};
      titles.forEach((title) => {
        titlesMap[title.id] = title.title;
      });
      setProblemTitles(titlesMap);

    } catch (err) {
    }
  };

  const handleGetCode = async (id, comment) => {
    try {
      const res = await customFetch(`/api/submissions/code/${id}`, "GET");
      setModalContent({ comment, code: res.code });
      setModalVisible(true);
    } catch (err) {
      toast.error("Failed to get code");
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <div>
      <Navbar />
      <div className={styles.userProfileContainer}>
        <div className={styles.userImageBox}>
          <img src={avatar} className={styles.userImage} alt="User Avatar" />
        </div>
        <div className={styles.userInfoBox}>
          <p className={styles.userInfoHeading}>User Profile</p>
          <p className={styles.userInfoName}>Name: {`${userProfile?.firstname} ${userProfile?.lastname}`}</p>
          <p className={styles.userInfoName}>Email: {userProfile?.email}</p>
          <p className={styles.userInfoName}>Problems Solved: {userProfile.problemsSolvedCount}</p>
        </div>
      </div>
        <button className={styles.seesubmissions_btn} onClick={seeSubmissions}>See Submissions</button>
      

      {userSubmissions.length > 0 && (
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>#</th>
              <th>Problem Title</th>
              <th>Language</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {userSubmissions?.map((submission, index) => (
              <tr key={index} onClick={() => handleGetCode(submission._id, submission.comment)}>
                <td>{index + 1}</td>
                <td>{problemTitles[submission.problem_id] || 'Loading...'}</td>
                <td>{submission.language}</td>
                <td>{submission.comment}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={modalVisible} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.comment}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AceEditor
            mode="c_cpp" // Adjust the mode to match the language of the code
            theme="monokai"
            name="code-editor"
            value={modalContent.code}
            readOnly
            width="100%"
            setOptions={{
              useWorker: false
            }}
            fontSize={18}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserProfile;
