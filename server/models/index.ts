import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../database.sqlite"),
  logging: false,
});

interface RoleAttributes {
  id: number;
  name: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}
export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  { sequelize }
);

interface UserAttributes {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  RoleId?: number;
}
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "RoleId"> {}
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public firstName!: string;
  public lastName!: string;
  public login!: string;
  public password!: string;
  public RoleId?: number;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    login: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize }
);

interface BookAttributes {
  id: number;
  title: string;
  author?: string;
  cover?: string;
  description?: string;
  pdfUrl?: string;
  genre?: string;
  discussionDeadline?: Date;
}
interface BookCreationAttributes extends Optional<BookAttributes, "id"> {}
export class Book extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
  public id!: number;
  public title!: string;
  public author?: string;
  public cover?: string;
  public description?: string;
  public pdfUrl?: string;
  public genre?: string;
  public discussionDeadline?: Date;
}

Book.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: DataTypes.STRING,
    cover: DataTypes.STRING,
    description: DataTypes.TEXT,
    pdfUrl: DataTypes.STRING,
    genre: DataTypes.STRING,
    discussionDeadline: DataTypes.DATE,
  },
  { sequelize }
);

interface SiteContentAttributes {
  id: number;
  data: any;
}
interface SiteContentCreationAttributes extends Optional<SiteContentAttributes, "id"> {}
export class SiteContent extends Model<SiteContentAttributes, SiteContentCreationAttributes> implements SiteContentAttributes {
  public id!: number;
  public data!: any;
}

SiteContent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  { sequelize }
);

interface CommentAttributes {
  id: number;
  text: string;
  date: Date;
  authorName?: string;
  userId?: number;
  bookId?: number;
}
interface CommentCreationAttributes extends Optional<CommentAttributes, "id"> {}
export class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public text!: string;
  public date!: Date;
  public authorName?: string;
  public userId?: number;
  public bookId?: number;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    authorName: DataTypes.STRING,
  },
  { sequelize }
);

interface QuoteAttributes {
  id: number;
  text: string;
  date: Date;
  userId?: number;
  bookId?: number;
}
interface QuoteCreationAttributes extends Optional<QuoteAttributes, "id"> {}
export class Quote extends Model<QuoteAttributes, QuoteCreationAttributes> implements QuoteAttributes {
  public id!: number;
  public text!: string;
  public date!: Date;
  public userId?: number;
  public bookId?: number;
}

Quote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  { sequelize }
);

Role.hasMany(User);
User.belongsTo(Role);

User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });

Book.hasMany(Comment, { foreignKey: "bookId" });
Comment.belongsTo(Book, { foreignKey: "bookId" });

User.hasMany(Quote, { foreignKey: "userId" });
Quote.belongsTo(User, { foreignKey: "userId" });

Book.hasMany(Quote, { foreignKey: "bookId" });
Quote.belongsTo(Book, { foreignKey: "bookId" });

User.belongsToMany(Book, { through: 'Reading', as: 'readingBooks' });
Book.belongsToMany(User, { through: 'Reading', as: 'readers' });

export async function initDb() {
  await sequelize.sync();
  const [userRole] = await Role.findOrCreate({ where: { name: "user" } });
  const [adminRole] = await Role.findOrCreate({ where: { name: "admin" } });

  const adminExists = await User.findOne({ where: { login: "admin" } });
  if (!adminExists) {
    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.default.hash("admin123", 10);
    await User.create({
      email: "admin@bookclub.com",
      firstName: "Admin",
      lastName: "User",
      login: "admin",
      password: hash,
      RoleId: adminRole.id,
    });
  }

  const defaultContent = {
    hero: {
      title: "Книжный Клуб",
      subtitle: "Читаем вместе, обсуждаем с удовольствием",
      description: "Присоединяйтесь к сообществу любителей литературы",
      imageUrl: "https://images.unsplash.com/photo-1709855256067-12ad9a64ac06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYm9vayUyMGNsdWIlMjByZWFkaW5nfGVufDF8fHx8MTc3MjU1NjcxM3ww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    features: [
      {
        id: "1",
        title: "Разнообразие жанров",
        description: "От классики до современной литературы — каждый найдёт книгу по душе",
        icon: "BookOpen"
      },
      {
        id: "2",
        title: "Дружное сообщество",
        description: "Общайтесь с единомышленниками и делитесь впечатлениями",
        icon: "Users"
      },
      {
        id: "3",
        title: "Живые обсуждения",
        description: "Обсуждайте сюжет, персонажей и делитесь своими мыслями",
        icon: "MessageCircle"
      }
    ],
    gallery: [
      {
        id: "1",
        title: "Ваша личная библиотека",
        description: "Доступ к электронным версиям книг",
        imageUrl: "https://images.unsplash.com/photo-1763616828336-e7fcd02086f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rc2hlbGYlMjBsaWJyYXJ5JTIwaG9tZXxlbnwxfHx8fDE3NzI1NTY3MTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: "2",
        title: "Читайте вместе с нами",
        description: "Еженедельные встречи и обсуждения",
        imageUrl: "https://images.unsplash.com/photo-1713942590283-59867d5e3f8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjByZWFkaW5nJTIwYm9va3MlMjB0b2dldGhlcnxlbnwxfHx8fDE3NzI1MjE0MDF8MA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ],
    booksSection: {
      title: "Наши книги",
      description: "Выберите книгу и присоединяйтесь к обсуждению. Делитесь мнениями, задавайте вопросы и находите новых друзей!"
    },
    footer: {
      text: "© 2026 Книжный Клуб. Читайте с удовольствием!"
    }
  };

  await SiteContent.findOrCreate({ where: { id: 1 }, defaults: { data: defaultContent } });
}

export { sequelize };
