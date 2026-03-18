import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { User, useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface UserWithPassword extends User {
  password: string;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithPassword[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithPassword | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    login: "",
    password: "",
    role: "user" as "admin" | "user"
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const token = localStorage.getItem("token");
    fetch("/api/users", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then((data: UserWithPassword[]) => setUsers(data))
      .catch(err => console.error(err));
  };

  const handleSaveUser = () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.login) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    if (editingUser) {
      fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(formData)
      })
        .then(() => {
          toast.success("Пользователь успешно обновлён");
          loadUsers();
          closeDialog();
        });
    } else {
      fetch(`/api/users`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData)
      }).then(() => {
        toast.success("Пользователь успешно добавлен");
        loadUsers();
        closeDialog();
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    if (user?.role === "admin" && users.filter(u => u.role === "admin").length === 1) {
      toast.error("Невозможно удалить последнего администратора");
      return;
    }

    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      const token = localStorage.getItem("token");
      fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(() => {
        setUsers(users.filter(user => user.id !== userId));
        toast.success("Пользователь успешно удалён");
      });
    }
  };

  const openEditDialog = (user: UserWithPassword) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      login: user.login,
      password: "",
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      login: "",
      password: "",
      role: "user"
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus style={{ width: 16, height: 16, marginRight: 8 }} />
                Добавить пользователя
              </Button>
            </DialogTrigger>
            <DialogContent style={{ maxWidth: "42rem" }}>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Редактировать пользователя" : "Добавить нового пользователя"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Имя *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Иван"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Фамилия *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Иванов"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="login">Логин *</Label>
                  <Input
                    id="login"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    Пароль {editingUser ? "(оставьте пустым, чтобы не менять)" : "*"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Роль</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "user") =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Пользователь</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Отмена
                </Button>
                <Button onClick={handleSaveUser}>
                  {editingUser ? "Сохранить изменения" : "Добавить пользователя"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список пользователей ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Логин</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Книг в чтении</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.login}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Администратор" : "Пользователь"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.readingBooks?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil style={{ width: 16, height: 16 }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === "admin" && users.filter(u => u.role === "admin").length === 1}
                        >
                          <Trash2 style={{ width: 16, height: 16, color: "var(--destructive)" }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
