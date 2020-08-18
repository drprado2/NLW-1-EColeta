import React from "react";
import './styles.css';
import {FiCheckCircle} from 'react-icons/fi';

const SuccessWarning = () => {

    return (
        <div id='success-warning'>
            <FiCheckCircle/>
            <strong>Cadastro concluído!</strong>
        </div>
    )
}

export default SuccessWarning;
