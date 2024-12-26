function Validation(values) {
    let error = {}
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/

    if (values.email === "") {
        error.email = "กรุณาใส่ email"
    }
    else if (!email_pattern.test(values.email)) {
        error.email = "ไม่พบ email นี้"
    }
    else {
        error.email = ""
    }

    if (values.password === "") {
        error.password = "กรุณาใส่ password"
    }
    else if (!password_pattern.test(values.password)) {
        error.password = "ไม่พบ password นี้"
    }
    else {
        error.password = ""
    }

    return error;
}

export default Validation;