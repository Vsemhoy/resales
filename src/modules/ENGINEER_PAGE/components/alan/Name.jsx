import { Select } from "antd";

const Name = ({ models, value, old, update_local_state, EDITMODE, index }) => {
    const format_models = models
        .map((el) => {
            return {
                value: el.id,
                key: el.id,
                label: el.name,
                type_model: el.type_model,
                count: 1,
            };
        })
        .filter((e) => e.type_model === 0);
    return (
        <Select
            showSearch
            optionFilterProp="label"
            value={value}
            variant={"borderless"}
            disabled={EDITMODE}
            onSelect={(e, v) => update_local_state("model", v, index)}
            style={{ width: "100%", borderBottom: old ? "1px solid red" : "none" }}
            filterSort={(optionA, optionB) =>
                (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={format_models}
        />
    );
};

export default Name;
