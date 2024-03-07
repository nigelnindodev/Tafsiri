import { UsersEntity } from "../../../postgres/entities";
import { HtmxTargets } from "../../common/constants";

export const ViewUserComponent = (userEntity: UsersEntity) => {
	return (
		<div>
			<nav>
				<ul>
					<li><strong>View User</strong></li>
				</ul>
				<ul>
					<li><a class="contrast" hx-get="/users/list" hx-target={`#${HtmxTargets.USERS_SECTION}`}>&lt Back</a></li>
				</ul>
			</nav>

			Username:
			{userEntity.username}
		</div>
	);
};
