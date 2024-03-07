import { UsersEntity } from "../../../postgres/entities";
import { HtmxTargets } from "../../common/constants";

export const UsersListComponent = (users: UsersEntity[]) => {
    return (
        <div>
            <h6>Users</h6>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Username</th>
                        <th>Admin</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        return (
                            <tr>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.is_admin ? "✅" : "❌"}</td>
                                <td>{user.is_active ? "✅" : "❌"}</td>
                                {
                                    user.is_admin ?
                                        <td><button disabled role="button" class="secondary outline" hx-get={`/users/${user.id}`} hx-target={`#${HtmxTargets.USERS_SECTION}`}>Edit</button></td> :
                                        <td><button role="button" class="secondary outline" hx-get={`/users/${user.id}`} hx-target={`#${HtmxTargets.USERS_SECTION}`}>Edit</button></td>
                                }
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};
