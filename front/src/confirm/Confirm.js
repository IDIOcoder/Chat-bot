import React, { useState } from 'react';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { Link } from 'react-router-dom';
import './Confirm.css'
import './Confirm_mobile.css'
import { Fade } from 'react-reveal';
import { BrowserView, MobileView } from 'react-device-detect';

const ConfirmEmail = () => {
    const [confirmationCode, setConfirmationCode] = useState('');
    const [username, setUsername] = useState('');

    const handleConfirmEmail = () => {
        const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({ region: 'ap-northeast-2' });

        const params = {
            ClientId: process.env.REACT_APP_COGNITO_CLIENTID,
            ConfirmationCode: confirmationCode,
            Username: username,
        };

        cognitoIdentityServiceProvider.confirmSignUp(params, (err) => {
            if (err) {
                const errorMessage = translateErrorMessage(err.code);
                alert(errorMessage);
            } else {
                alert("이메일 인증이 완료되었습니다.");
            }
        });
    };
    const translateErrorMessage = (errorCode) => {
        /*오류메세지를 한글로 출력하기 위함
        오류종류는 3가지로만 구분*/
        switch (errorCode) {
            case 'UserNotFoundException':
                return '가입되어 있지않은 사용자입니다.';
            case 'CodeMismatchException':
                return '올바른 코드를 입력해주세요!';
            case 'ExpiredCodeException':
                return '이미 만료된 코드입니다.\n올바른 코드로 입력해주세요.'
            default:
                return '확인코드가 올바르지 않습니다.';
        }
    };

    return (
        <div className='email'>
        <BrowserView>
            <div className="margin_Con"></div>
            <Fade right delay = {0}>
            <div className='confirm-container'>
            <h2>이메일 확인</h2>
            <input type='text' placeholder="아이디" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="text" placeholder="확인 코드" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} />
            <button onClick={handleConfirmEmail}>확인</button>
            <Link to ='/' className='to_login'>로그인 페이지</Link>
            </div>
        </Fade>
        </BrowserView>
        <MobileView>
        <div className='margin_em_mobile'/>
            <Fade right delay = {0}>
            <div className='confirm-container-mobile'>
            <h2>이메일 확인</h2>
            <input type='text' placeholder="아이디" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="text" placeholder="확인 코드" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} />
            <button onClick={handleConfirmEmail}>확인</button>
            <Link to ='/' className='to_login'>로그인 페이지</Link>
            </div>
            </Fade>
        </MobileView>
        </div>
    );
};

export default ConfirmEmail;