// RegisterValidation.js

export default function Validation(values) {
    let errors = {};

    // ตรวจสอบเบอร์โทรศัพท์
    if (!values.phone) {
        errors.phone = "Please enter your phone number.";
    } else if (!/^[\d+]+$/.test(values.phone)) {
        errors.phone = "กรุณากรอกเฉพาะตัวเลขและเครื่องหมาย + เท่านั้น";
    } else if (values.phone[0] !== '0' && values.phone[0] !== '+') {
        errors.phone = "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 หรือ +";
    // } else if (values.phone[0] === '+' && !/^(0)(6|8|9)/.test(values.phone)) {
    //     errors.phone = "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย +66, 06, 08 หรือ 09 เท่านั้น";
    } else if (values.phone[0] === '0' && !/^0(6|8|9)/.test(values.phone)) {
        errors.phone = "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 06, 08 หรือ 09 เท่านั้น";
    } else if (values.phone.length !== 10 && values.phone[0] === '0') {
        errors.phone = "เบอร์โทรศัพท์ต้องมี 10 ตัวอักษร";
    } else if (values.phone.length < 10 && values.phone[0] === '+') {
        errors.phone = "เบอร์โทรศัพท์ต้องมีความยาว 10 ตัวหากใช้ +66";
    }
    

    // การตรวจสอบอื่นๆ (เช่นชื่อ, อีเมล, รหัสผ่าน)
    if (!values.name) {
        errors.name = "Please enter your name";
    }
    
    if (!values.lastname) {
        errors.lastname = "Please enter your lastname";
    }

    // if (!values.username) {
    //     errors.username = "กรุณากรอกชื่อผู้ใช้";
    // }

    if (!values.email) {
        errors.email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = "Email format is invalid.";
    }

    if (!values.password) {
        errors.password = "กรุณากรอกรหัสผ่าน";
    } else if (values.password.length < 8) {
        errors.password = "Password format is invalid";
    }

    return errors;
}
