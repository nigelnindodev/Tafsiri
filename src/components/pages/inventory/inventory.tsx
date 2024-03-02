import { HtmxTargets } from "../../common/constants"

export const ViewInventorySection = () => {
    return (
        <div>
            <div class="grid">
                <div>
                    <input type="search" id="search" name="search" placeholder="Search Inventory" hx-get="/inventory/list/search" hx-trigger="keyup changed delay:500ms" hx-target={`#${HtmxTargets.INVENTORY_DATA_LIST}`} />
                </div>
                <div>
                    <div class="grid">
                        <div></div>
                        <div>
                            <button role="button" class="outline" hx-get="/inventory/create" hx-target={`#${HtmxTargets.INVENTORY_SECTION}`}>Add New</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id={HtmxTargets.INVENTORY_DATA_LIST} hx-get="/inventory/list/all" hx-trigger="load" />
        </div>
    );
};
