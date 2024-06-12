import React, { useState } from 'react';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { Link } from 'react-router-dom';
import './Password.css';
import './Password_mobile.css';
import { Fade } from 'react-reveal';
import {BrowserView,MobileView} from "react-device-detect";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage,setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({ region: 'ap-northeast-2' });

    const handleForgotPassword = () => {
        const params = {
            ClientId: process.env.REACT_APP_COGNITO_CLIENTID,
            Username: email
        };

        cognitoIdentityServiceProvider.forgotPassword(params, (err, data) => {
            if (err) {
                setErrorMessage(err.message);
            } else {
                setSuccessMessage('인증 코드가 이메일로 전송되었습니다.');
                console.log(data);
            }
        });
    };

    const handleConfirmForgotPassword = () => {
        const params = {
            ClientId: process.env.REACT_APP_COGNITO_CLIENTID,
            ConfirmationCode: confirmationCode,
            Password: newPassword,
            Username: email
        };

        cognitoIdentityServiceProvider.confirmForgotPassword(params, (err, data) => {
            if (err) {
                switch(err.code){
                    case 'CodeMismatchException':
                        setErrorMessage("인증번호가 올바르지 않습니다.");
                        break;
                    case 'UserNotFoundException':
                        setErrorMessage("등록된 사용자를 찾을 수 없습니다.");
                        break;
                    case 'ExpiredCodeException':
                        setErrorMessage("인증코드의 유효기간이 만료되었습니다.");
                        break;
                    case 'TooManyRequestsException':
                        setErrorMessage("너무 많은 요청입니다.")
                        break;
                    default:
                        setErrorMessage("잘못된 인증입니다.");
                }
            } else {
                setSuccessMessage('비밀번호가 성공적으로 재설정되었습니다.'+data);
            }
        });
    };
    const reset = () => {
        localStorage.removeItem('loggedInUser');
    };

    return (
        <div>
        <BrowserView>
        <div className='margin'></div>
        <Fade left delay = {0}>
        <div className="forgot-password-container">
                <h2>비밀번호 재설정</h2>
                {!successMessage && (
                    <>
                        <input type="text" placeholder="아이디" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <button onClick={handleForgotPassword}>이메일로 인증 코드 전송</button>
                    </>
                )}
                {successMessage && <p className="success-message">{successMessage}</p>}
                {successMessage && (
                    <>
                        <input type="text" placeholder="인증 코드" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} />
                        <input type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <button onClick={handleConfirmForgotPassword}>비밀번호 재설정</button>
                    </>
                )}
                <Link to ='/' className='to_login'onClick={reset}>로그인 페이지</Link>
            </div>
            </Fade>
            </BrowserView>
    <MobileView>
        <div className='margin_p_mobile'></div>
    <Fade left delay = {0}>
    <div className="forgot-password-container-mobile">
            <h2>비밀번호 재설정</h2>
            {!successMessage && (
                <>
                    <input type="text" placeholder="아이디" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <button onClick={handleForgotPassword}>이메일로 인증 코드 전송</button>
                </>
            )}
            {successMessage && <p className="success-message-mobile">{successMessage}</p>}
            {successMessage && (
                <>
                    <input type="text" placeholder="인증 코드" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} />
                    <input type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <button onClick={handleConfirmForgotPassword}>비밀번호 재설정</button>
                </>
            )}
            <Link to ='/' className='to_login'onClick={reset}>로그인 페이지</Link>
        </div>
        </Fade>
        </MobileView>
        </div>
    );
};

export default ForgotPassword;
