import React from 'react';
import { Link } from 'react-router-dom';
import '../CSS/LoginForm.css';

const Login = () => {

  return (
    <div className="container">
      <main className="login-page">
        <div className="text-center">
          <h3 style={{ fontWeight: 'bold' }}>Login</h3>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="login-box">
              <form id="f-admin" className="needs-validation" noValidate>

                <div className="row g-4 step1 active">
                  <div className="col-12">
                    <h5 className="objective">กรุณาเลือกวัตถุประสงค์การใช้งาน</h5>
                  </div>
                  <div className="col-md-12">
                    <Link to="/logincus"
                      onClick={() => {
                        window.scrollTo(0, 0);
                      }} className="btn btn-idol round-medium btn-lg" style={{ width: '100%' }}>
                      Customer
                    </Link>
                  </div>
                  <div className="col-md-12">
                    <div className="row">
                      <div className="col-5">
                        <hr />
                      </div>
                      <div className="col-2">
                        <p>หรือ</p>
                      </div>
                      <div className="col-5">
                        <hr />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <Link to="/emp"
                      onClick={() => {
                        window.scrollTo(0, 0);
                      }}
                      className="btn btn-idol outline btn-lg" style={{ width: '100%' }}>
                      Employee
                    </Link>
                  </div>
                  {/* <div className="col-md-12">
                    <div className="row">
                      <div className="col-5">
                        <hr />
                      </div>
                      <div className="col-2" >
                        <p>หรือ</p>
                      </div>
                      <div className="col-5">
                        <hr />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <Link to="/loginesta"
                      onClick={() => {
                        window.scrollTo(0, 0);
                      }}
                      className="btn btn-idol outline btn-lg" style={{ width: '100%' }}>
                      สถานประกอบการ
                    </Link>
                  </div> */}
                  <div className="col-md-12">

                  </div>
                  <div style={{ marginTop: '50px' }} className="col-md-6">
                    <Link to="/register" onClick={() => {
                      window.scrollTo(0, 0);
                    }}
                      className="btn btn-idol-outline round" style={{ width: '100%' }}>
                      Register
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
