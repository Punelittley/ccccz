import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { BookOpen } from "lucide-react";

export default function Auth() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { login: loginUser, register } = useAuth();
  const navigate = useNavigate();

  const isValidName = (name: string) => {
    // Allow only letters (including Cyrillic), no spaces or special characters
    const nameRegex = /^[а-яА-ЯёЁa-zA-Z]*$/;
    return nameRegex.test(name);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, and hyphens
    if (isValidName(value)) {
      setFirstName(value);
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, and hyphens
    if (isValidName(value)) {
      setLastName(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      // Validation for email (max 20 characters)
      if (email.length > 20) {
        setError("Email не должен превышать 20 символов");
        return;
      }
      // Validation for firstName (max 15 characters)
      if (firstName.length > 15) {
        setError("Имя не должно превышать 15 символов");
        return;
      }
      // Validation for firstName (only letters)
      if (!isValidName(firstName)) {
        setError("Имя не должно содержать цифры и специальные символы");
        return;
      }
      // Validation for lastName (max 15 characters)
      if (lastName.length > 15) {
        setError("Фамилия не должна превышать 15 символов");
        return;
      }
      // Validation for lastName (only letters)
      if (!isValidName(lastName)) {
        setError("Фамилия не должна содержать цифры и специальные символы");
        return;
      }
      // Validation for login (max 15 characters)
      if (login.length > 15) {
        setError("Логин не должен превышать 15 символов");
        return;
      }
      // Validation for password (max 15 characters)
      if (password.length > 15) {
        setError("Пароль не должен превышать 15 символов");
        return;
      }
      if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
      }
      if (password.length < 6) {
        setError("Пароль должен содержать минимум 6 символов");
        return;
      }

      // register returns a promise; wait for result before navigating
      const success = await register(email, firstName, lastName, login, password);
      if (success) {
        // сразу залогинить нового пользователя, чтобы он мог попасть в профиль
        const loggedIn = await loginUser(login, password);
        if (loggedIn) {
          navigate("/profile");
        } else {
          // редирект на страницу входа, если авто‑логин по какой‑то причине не прошёл
          navigate("/login");
        }
      } else {
        setError("Пользователь с таким логином или email уже существует");
      }
    } else {
      // Validation for login (max 15 characters)
      if (login.length > 15) {
        setError("Логин не должен превышать 15 символов");
        return;
      }
      // Validation for password (max 15 characters)
      if (password.length > 15) {
        setError("Пароль не должен превышать 15 символов");
        return;
      }
      const success = await loginUser(login, password);
      if (success) {
        // проверить роль сохранённого пользователя
        const saved: any = JSON.parse(localStorage.getItem("currentUser") || "{}");
        if (saved.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError("Неверный логин или пароль");
      }
    }
  };

  return (
    <div className="app-page flex items-center justify-center p-4 section-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
         
          <CardTitle className="text-2xl text-center">
            {isRegister ? "Регистрация" : "Вход"}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegister
              ? "Создайте аккаунт в Книжном Клубе"
              : "Войдите в свой аккаунт Книжного Клуба"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={20}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      placeholder="Иван"
                      value={firstName}
                      onChange={handleFirstNameChange}
                      maxLength={15}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      placeholder="Иванов"
                      value={lastName}
                      onChange={handleLastNameChange}
                      maxLength={15}
                      required
                    />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="login">{isRegister ? "Логин" : "Логин"}</Label>
              <Input
                id="login"
                placeholder={isRegister ? "ivan_ivanov" : "Введите логин"}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                maxLength={15}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder={isRegister ? "" : "Введите пароль"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={15}
                required
              />
            </div>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  maxLength={15}
                  required
                />
              </div>
            )}
            {error && (
              <div className="text-sm text-destructive text-center">{error}</div>
            )}
            <Button type="submit" className="w-full">
              {isRegister ? "Зарегистрироваться" : "Войти"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted text-center">
            {isRegister ? (
              <>Уже есть аккаунт? <Link to="/login" className="link-primary">Войти</Link></>
            ) : (
              <>Нет аккаунта? <Link to="/register" className="link-primary">Зарегистрироваться</Link></>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
