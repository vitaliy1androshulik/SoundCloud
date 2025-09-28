import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setLocalPassword } from "../../services/authApi";
// import axios, { AxiosError } from 'axios';
import axios from 'axios';
import "../../styles/login_signup/set_password.css";

const SetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [pwd, setPwd] = useState("");
    const [cpwd, setCpwd] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        if (pwd.length < 8) {
            setErr("Пароль має містити щонайменше 8 символів");
            return;
        }
        if (pwd !== cpwd) {
            setErr("Підтвердження пароля не збігається");
            return;
        }
        try {
            setLoading(true);
            await setLocalPassword(pwd, cpwd);
            alert("Локальний пароль встановлено. Можете входити і локально.");
            navigate("/home");
        } catch (e: unknown) {
            let msg = "Помилка встановлення пароля";
            // if (e instanceof AxiosError) {
            //     msg = e.response?.data?.error || e.response?.data?.msg;  // Без any, бо data — object з error: string
            //     // msg = (e.response?.data as any)?.error || (e.response?.data as any)?.message || msg;
            if (axios.isAxiosError(e)) {
                const data = e.response?.data as { error?: string; message?: string; detail?: string } | string | undefined;
                msg =
                    typeof data === "string"
                        ? data
                        : data?.error || data?.message || data?.detail || msg;
            } else if (e instanceof Error) {
                msg = e.message || msg;
            }
            setErr(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="set-password-page">
            <h2>Встановити локальний пароль</h2>
            <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
                <div className="form-row">
                    <label htmlFor="new-password">Новий пароль</label>
                    {/*<input type="password" value={pwd} onChange={e => setPwd(e.target.value)} />*/}
                    <input
                        type="password"
                        id="new-password"
                        name="new-password"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>
                <div className="form-row">
                    {/*<label>Підтвердження пароля</label>*/}
                    <label htmlFor="confirm-password">Підтвердження пароля</label>
                    {/*<input type="password" value={cpwd} onChange={e => setCpwd(e.target.value)} />*/}
                    <input
                        type="password"
                        id="confirm-password"
                        name="confirm-password"
                        value={cpwd}
                        onChange={(e) => setCpwd(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>

                {err && <div className="error">{err}</div>}
                <div className="btn-row">
                    <div className="btn-row">
                        <button disabled={loading} type="submit" className="btn btn-primary">
                            {loading ? "Зберігаю..." : "Зберегти пароль"}
                        </button>

                        <button type="button" className="btn btn-secondary" onClick={() => navigate("/profile")}>
                            Скасувати
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SetPassword;
