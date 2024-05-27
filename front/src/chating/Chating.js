import React, { useEffect, useState, useRef, useCallback } from "react";
import './Chating.css';
import { useNavigate } from 'react-router-dom';
import { Reveal,Fade } from "react-reveal";
import axios from "axios";

const View = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const initialRender = useRef(true);
    const messagesEndRef = useRef(null);

    const handleSignOut = () => {
        sessionStorage.removeItem('loginType');
        sessionStorage.removeItem('sub');
        navigate('/');
    };

    const getAccessTokenFromUrl = () => {
        const hash = window.location.hash;
        const match = hash.match(/access_token=([^&]*)/);
        return match ? match[1] : null;
    };

    const fetchUserInfo = useCallback(async (accessToken1) => {
        try {
            const loginType = sessionStorage.getItem('loginType');
            if(loginType==='google'){sessionStorage.setItem('sub',accessToken1)};
            const accessToken = sessionStorage.getItem('sub');
            console.log(accessToken,loginType);
            const response = await axios.get('aws_lambda_endpoint/social_login', {
                params: {
                    accessToken: accessToken,
                    loginType: loginType
                }
            });
            const info = response.data;
            setUserInfo(info.sub);
            sessionStorage.setItem('sub', info.sub);
            console.log("유저 키 : " + sessionStorage.getItem('sub'));
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }, []);
    

    const sess = useCallback(() => {
        const accessToken = getAccessTokenFromUrl();

        if (accessToken) {
            fetchUserInfo(accessToken);
        } else {
            console.error('엑세스 토큰을 찾을 수 없습니다.');
        }
    }, [fetchUserInfo]);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            const loginType = sessionStorage.getItem('loginType');
            const sub = sessionStorage.getItem('sub');
            if (loginType === 'google') {
                if (sub) {
                    console.log('Stored sub:', sub);
                    navigate('/chating');
                } else {
                    sess();
                }
            } else if (loginType === 'regular') {
                fetchUserInfo();
                console.log('logined regular');
            }
        }
    }, [sess, fetchUserInfo]);
    
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSendClick = () => {
        if (inputValue.trim() !== '') {
            const formattedMessage = inputValue.length > 20 
                ? inputValue.match(/.{1,80}/g).join('\n') 
                : inputValue;
            setMessages([...messages, formattedMessage]);
            setInputValue('');
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendClick();
        }
    };
    return (
        <div>
            <Reveal>
                <div className="chat-container">
                <div className="margin-1"></div>
                    <div className="left-half">
                        <img src="icon_reverse.png" className="logo1"></img>
                        <div className="icon_chat">
                            <img src="icon_chat.png" alt="chat" style={{cursor:'pointer'}}width="50px"></img>
                        </div>
                        <div className="icon_archive"> 
                            <img src="icon_archive.png" alt="archive" style={{cursor:'pointer'}}width="50px"></img>
                        </div>
                        <div className="icon_settings">
                            <img src="icon_settings.png" alt="settings" style={{cursor:'pointer'}}width="50px"></img>
                        </div>
                        <div className="icon_exit">
                            <img src="icon_exit.png" alt="exit" style={{cursor:'pointer'}}onClick={handleSignOut}width="55px"></img>
                        </div>
                    </div>
                    <div className="right-half">
                    <div className="chat">
                        <div className="chating-container">
                        <div className="messages">
                                {messages.map((msg, index) => (
                                    <Fade key={index} bottom>
                                        <div className="message">
                                            {msg}
                                        </div>
                                    </Fade>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                        <div className="input-container">
                    <input type='text' placeholder="채팅을 입력하세요" value={inputValue} onKeyPress={handleKeyPress} onChange={handleInputChange}></input>
                    <img src="icon_send.png" alt="send" className="send" style={{cursor:'pointer'}}onClick={handleSendClick}></img>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="margin-bot"></div>
            </Reveal>
        </div>
    );
};

export default View;
