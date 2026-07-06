- app name is `G.P. News`
- bundle id is `com.gp.gp-group`
- only native app, no web app will be hosted
- optimize for mobile first and then for tablet. Desktop is not required.
- for mobile the minimal size is `360px CSS pixels`
- translations - no, the app is only in [bulgarian]
- follow the instructions in `./AGENTS.md`

# Additional notes
- design has both light and dark theme, please implement both and make it possible to switch between them, the default theme is depending on the system theme
- do not add translations libraries
- add push notifications
- Да може да се оставя коментар под новините (check if that is added in the design and if it is get it from there)
  В преглед на новина да има:
показване на списък с коментари - да има име, дата и коментар
бутон Добави коментар - отваря форма за писане на коментар (ако си логнат) само едно поле за коментар.
при датата на самата новина, да добвим брой коментари с линк към долната част на новината
- Нова секция Моята новина (check if that is added in the design and if it is get it from there)
  Нов таб "Добави новина"
Възможност да се публикува заглавие, снимка и кратък текст, но преди да стане видима, да минава разбира се през одобрение на админ - да подаваш id на потребител (само за логнати е това)

# Backend
- for developing purposes use mock-backend you can find in `C:/Users/twrkh/Projects/backend-mock`
- if there is changes made in frontend always check if they are reflected in backend
