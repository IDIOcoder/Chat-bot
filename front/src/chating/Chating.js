import React, { useEffect, useState, useRef, useCallback } from "react";
import './Chating.css';
import './Chating_mobile.css';
import { useNavigate} from 'react-router-dom';
import axios from "axios";
import { BrowserView, MobileView } from "react-device-detect";
import DOMPurify from 'dompurify';
import CustomTypingEffect from './CustomEffect';

const View = ({ mode, settingMode }) => {
    let navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const cancelTokenSource = useRef(null);
    const [menuVisible,setMenuVisible] = useState(false);
    const initialRender = useRef(true);
    const messageEndRef = useRef(null);

const handleSignOut = () => {
    const logType = sessionStorage.getItem('loginType')
    if(logType==='regular'){
        sessionStorage.clear();
        navigate('/');
    }
    else if(logType==='google'){
        sessionStorage.clear();
        navigate('/');
    }
};

const getAccessTokenFromUrl = () => {
    const hash = window.location.href;
    const match = hash.match(/code=([^&]*)/);
    return match ? match[1] : null;
};

const axiosUserInfo = useCallback(async (code1) => {
    try {
        const loginType = sessionStorage.getItem('loginType');
        if (loginType === 'google') {
            sessionStorage.setItem('code',code1);
            // sessionStorage.setItem('accessToken', accessToken1);
        }
        const code = sessionStorage.getItem('code');
        const refreshToken = sessionStorage.getItem('refreshToken');
        const accessToken = sessionStorage.getItem('accessToken');
        console.log(accessToken, loginType);
        const response = await axios.get(process.env.REACT_APP_LAMBDA_LOGIN_GET, {
            params: {
                loginType: loginType,
                accessToken: accessToken,
                refreshToken: refreshToken,
                code:code,
            }
        });
        if(loginType==='google'){
            const access_Token = response.data.access_token;
            const refresh_Token = response.data.refresh_token;
            sessionStorage.removeItem('code');
            sessionStorage.setItem('accessToken',access_Token);
            sessionStorage.setItem('refreshToken',refresh_Token);
            console.log(access_Token+" / "+refresh_Token);
            navigate('/chating')
        }
    } catch (error) {
        console.error('Error networkind user info:', error);
    }
}, []);

const sess = useCallback(() => {
    const code = getAccessTokenFromUrl();
    if (code) {
        axiosUserInfo(code);
    }
    // const b = window.location.href.match(/error=([^&]*)/)[1];
    //         if(b==='access_denied'){
    //             alert("로그인 에러가 발생해 게스트로 동작합니다...")
    //         }
}, [axiosUserInfo]);

const scrollToBottom = useCallback(() => {
    try {
        if (messageEndRef.current) {
            requestAnimationFrame(() => {
                messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
            });
        } else {
            console.warn('messageEndRef is null');
        }
    } catch (error) {
        console.error('Error scrolling to bottom:', error);
    }
}, []);

useEffect(() => {
    scrollToBottom();
}, [messages, scrollToBottom]);

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
            axiosUserInfo();
            console.log('logined regular');
        }
    }
}, [sess, axiosUserInfo]);

const handleInputChange = (e) => {
    setInputValue(e.target.value);
};

const sendMessageLambda = async (message1) => {
    try {
        const recog = sessionStorage.getItem('sub');
        cancelTokenSource.current = axios.CancelToken.source();
        const response = await axios.get(process.env.REACT_APP_LAMBDA_SEND_GET, {
            params: {
                // sub: recog,
                message: message1,
            },
            cancelToken: cancelTokenSource.current.token
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { message: '존재하지 않는 레시피입니다....' };
        } else if (error.response.status === 500) {
            return { message: '서버와의 연결이 원활하지 않습니다.... 잠시 후에 다시 시도해주세요.' };
        } else {
            return { message: '전송 오류가 발생했습니다!' };
        }
    }
};

const handleSendClick = async () => {
    if (inputValue.trim() !== '') {
        setIsSending(true);
        const formattedMessage = inputValue.length > 20
            ? inputValue.match(/.{1,70}/g).join('\n')
            : inputValue;
        setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: formattedMessage }, { sender: 'ai', text: 'spinner' }]);
        setInputValue('');

        const reply = await sendMessageLambda(formattedMessage);
        if (reply) {
            setMessages((prevMessages) => prevMessages.filter((msg) => msg.text !== 'spinner').concat({ sender: 'ai', text: reply.message || '오류가 발생했습니다!' }));
        }
        setIsSending(false);
    } else {
        alert("입력된 값이 없습니다.");
    }
};

const handleCancelClick = () => {
    if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel();
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.text !== 'spinner'));
        setIsSending(false);
    }
};
const toggleMenu = () => {
    setMenuVisible(!menuVisible); 
};
const closeMenu = () => {
    setMenuVisible(false); 
};
const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSending) {
        handleSendClick();
    }
};

return (
<div>
<BrowserView>
    <div className="chat-container">
        <div className="margin-1"></div>
        <div className="left-half">
            <img src="icon_reverse.png" className="logo1" alt="logo"></img>
            <div className="icon_mode">
                <label className="switch">
                    <input type="checkbox" checked={mode} onChange={settingMode} />
                    <span className="slider round"></span>
                </label>
            </div>
            <div className="icon_chat">
                <img src="icon_chat.png" alt="chat" style={{ cursor: 'pointer' }} width="50vh"></img>
            </div>
            <div className="icon_archive">
                <img src="icon_archive.png" alt="archive" style={{ cursor: 'pointer' }} width="50px"></img>
            </div>
            <div className="icon_exit">
                <img src="icon_exit.png" alt="exit" style={{ cursor: 'pointer' }} onClick={handleSignOut} width="55px"></img>
            </div>
        </div>
    <div className="right-half">
        <div className="chat">
    <div className="chating-container">
        <div className="messages">
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                {msg.sender === 'ai' && msg.text !== 'spinner' ? (
                <CustomTypingEffect
                    text={msg.text}
                    speed={40}
                    scrollToBottom={scrollToBottom}
                    // onComplete={scrollToBottom}
                    />) : 
                (msg.text === 'spinner' ? (
                    <div className="spinner-container">
                        <div className="spinner"/>
                    </div>) : 
                    (<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }}></div>
                ))}</div>
            ))}<div ref={messageEndRef} />
                </div>
            </div>
            <div className="input-container">
                <input type='text' placeholder="채팅을 입력하세요" value={inputValue} onKeyPress={handleKeyPress} onChange={handleInputChange}></input>
                <button onClick={isSending ? handleCancelClick : handleSendClick} disabled={isSending} style={{ background: 'none', border: 'none', padding: 0 }}>
                <img 
                    src={isSending ? (mode ? "icon_stop_dark.png" : "icon_stop.png") : (mode ? "icon_send_dark.png" : "icon_send.png")}
                    alt="send" 
                    style={{ cursor: 'pointer' }} 
                />
                </button>
                </div>
                </div>
            </div>
            <div className="margin-bot"></div>
        </div>
            </BrowserView>
            <MobileView>
            <div className="chat-container-mobile">
            <div className={`overlay ${menuVisible ? 'show' : ''}`} onClick={closeMenu}></div>
                <div className="top-container-mobile">
                <div className="icon_menu_mobile" onClick={toggleMenu}>
                    <img src="menu.png" alt="menu" className="menu-icon"/>
                </div>
                <div className="center-text">
                공감 식당
                </div>
                </div>
                <div className={`menu-bar ${menuVisible ? 'show' : ''}`}>
                {}
                <div className="icon_setting">
                    <img src="icon_settings.png" alt="set" width="30px" style={{cursor : 'pointer'}}/>
                </div>
                <div className="bottom-section">
                <div className="icon_exit_mobile" onClick={handleSignOut}>
                    <img src="icon_exit.png" alt="exit"style={{ cursor: 'pointer' }} />
                </div>
                </div>
                {/* 추가 메뉴 아이템들 */}
                </div>
        <div className="bottom-container-mobile">
            <div className="messages-mobile">
            {messages.map((msg, index) => (
            <div key={index} className={`message-mobile ${msg.sender}`}>
                {msg.sender === 'ai' && msg.text !== 'spinner' ? (
                    <div className="ai-message-wrapper">
                        <div className="ai-icon-container">
                            <img src="icon.png" alt="AI Icon" className="ai-icon" />
                        </div>
                    <div className="ai-message-container">
                    <CustomTypingEffect text={msg.text} speed={40} 
                    scrollToBottom={scrollToBottom} 
                    // onComplete={scrollToBottom}
                    />
                    </div>
                </div>) : 
                (msg.text === 'spinner' ? (
                    <div className="spinner-container-mobile">
                        <div className="spinner-mobile"/>
                    </div>) : 
                    (<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }}></div>
            ))}</div>))}<div ref={messageEndRef} />
        </div>
            </div>
            <div className="input-container-mobile">
                <input type='text' placeholder="채팅 입력!" value={inputValue} onKeyPress={handleKeyPress} onChange={handleInputChange}></input>
                <button onClick={isSending ? handleCancelClick : handleSendClick} disabled={isSending} style={{ background: 'none', border: 'none', padding: 0 }}>
                    <img src={isSending ? "icon_stop.png" : "icon_send.png"}
                        alt="send" style={{ cursor: 'pointer' }} />
                </button>
                </div>
            </div>
            </MobileView>
        </div>
    );
};

export default View;
