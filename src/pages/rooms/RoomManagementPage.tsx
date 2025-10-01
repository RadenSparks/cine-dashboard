import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppButton from "../../components/UI/AppButton";
import { SatelliteToast } from "../../components/UI/SatelliteToast";
import Loading from "../../components/UI/Loading";

// Table columns: Name, Capacity, Rows, Cols, Created, Updated, Actions

const MOCK_ROOMS = [
	{
		room_id: 1,
		room_name: "Room A",
		room_capacity: 96,
		room_rows: 8,
		room_cols: 12,
		room_layout: "",
		premium_seats: "A1,A2,B5,B6",
		empty_seats: ["A6", "B1"],
		created_at: "2025-09-01",
		updated_at: "2025-09-01",
		deleted: false
	},
	{
		room_id: 2,
		room_name: "Room B",
		room_capacity: 60,
		room_rows: 6,
		room_cols: 10,
		room_layout: "",
		premium_seats: "C3,C4,C5,C6",
		empty_seats: [],
		created_at: "2025-09-01",
		updated_at: "2025-09-01",
		deleted: false
	}
];

const ROWS = 8;
const COLS = 12;

function seatId(row: number, col: number) {
	return `${String.fromCharCode(65 + row)}${col + 1}`;
}

export default function RoomManagementPage() {
	const [rooms, setRooms] = useState(MOCK_ROOMS);
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
	const selectedRoom = rooms.find(r => r.room_id === selectedRoomId);

	// Local premium seats state
	const [localPremiumSeats, setLocalPremiumSeats] = useState<string[]>([]);
	const [localEmptySeats, setLocalEmptySeats] = useState<string[]>([]);

	useEffect(() => {
		if (selectedRoom) {
			setLocalPremiumSeats(selectedRoom.premium_seats?.split(",").filter(Boolean) ?? []);
			setLocalEmptySeats(selectedRoom.empty_seats?.filter(Boolean) ?? []);
		}
	}, [selectedRoomId]);

	const [filter, setFilter] = useState<"all" | "economy" | "premium">("all");
	const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newRoomName, setNewRoomName] = useState("");
	const [newRoomRows, setNewRoomRows] = useState(ROWS);
	const [newRoomCols, setNewRoomCols] = useState(COLS);

	const [showEditModal, setShowEditModal] = useState(false);
	const [editRoomName, setEditRoomName] = useState("");
	const [editRoomRows, setEditRoomRows] = useState(8);
	const [editRoomCols, setEditRoomCols] = useState(12);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [roomToDelete, setRoomToDelete] = useState<number | null>(null);

	const [showConfigModal, setShowConfigModal] = useState(false);

	const toastRef = useRef<{ showNotification: (options: Omit<unknown, "id">) => void }>(null);

	useEffect(() => {
		setInitialLoading(true);
		const timer = setTimeout(() => setInitialLoading(false), 400);
		return () => clearTimeout(timer);
	}, [rooms]);

	if (initialLoading) {
		return <Loading />;
	}

	function handleCreateRoom() {
		if (!newRoomName || !newRoomRows || !newRoomCols) return;
		const newRoom = {
			room_id: rooms.length + 1,
			room_name: newRoomName,
			room_capacity: newRoomRows * newRoomCols,
			room_rows: newRoomRows,
			room_cols: newRoomCols,
			room_layout: "",
			premium_seats: "",
			empty_seats: [],
			created_at: new Date().toISOString().slice(0, 10),
			updated_at: new Date().toISOString().slice(0, 10),
			deleted: false
		};
		setRooms([...rooms, newRoom]);
		setShowCreateModal(false);
		setNewRoomName("");
		setNewRoomRows(ROWS);
		setNewRoomCols(COLS);
		toastRef.current?.showNotification({
			title: "Room Created",
			content: `Room "${newRoomName}" added.`,
			accentColor: "#2563eb",
			position: "bottom-right",
			longevity: 3000,
		});
	}

	function handleDeleteRoom(room_id: number) {
		setRooms(rooms.filter(room => room.room_id !== room_id));
		setShowDeleteModal(false);
		setRoomToDelete(null);
		if (selectedRoomId === room_id) setSelectedRoomId(null);
	}

	function openEditModal(room: typeof MOCK_ROOMS[0]) {
		setEditRoomName(room.room_name);
		setEditRoomRows(room.room_rows);
		setEditRoomCols(room.room_cols);
		setSelectedRoomId(room.room_id);
		setShowEditModal(true);
	}

	function handleEditRoom() {
		if (!selectedRoom) return;
		setRooms(rooms.map(room =>
			room.room_id === selectedRoom.room_id
				? {
					...room,
					room_name: editRoomName,
					room_rows: editRoomRows,
					room_cols: editRoomCols,
					room_capacity: editRoomRows * editRoomCols,
					updated_at: new Date().toISOString().slice(0, 10),
				}
				: room
		));
		setShowEditModal(false);
		toastRef.current?.showNotification({
			title: "Room Updated",
			content: `Room "${editRoomName}" updated.`,
			accentColor: "#2563eb",
			position: "bottom-right",
			longevity: 3000,
		});
	}

	function openConfigModal(room: typeof MOCK_ROOMS[0]) {
		setSelectedRoomId(room.room_id);
		setShowConfigModal(true);
	}

	function handleUpdateSeats() {
		if (!selectedRoom) return;
		setLoading(true);
		setTimeout(() => {
			setRooms(rooms.map(room =>
				room.room_id === selectedRoom.room_id
					? { ...room, premium_seats: localPremiumSeats.join(","), empty_seats: localEmptySeats }
					: room
			));
			setLoading(false);
			setShowConfigModal(false);
			toastRef.current?.showNotification({
				title: "Room Updated",
				content: `Seat configuration for "${selectedRoom.room_name}" saved.`,
				accentColor: "#2563eb",
				position: "bottom-right",
				longevity: 3000,
			});
		}, 800);
	}

	// --- Table Layout ---
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950 py-10 hide-scrollbar">
			<div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16">
				<h2 className="text-3xl font-extrabold mb-10 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
					🏟️ Room Management
				</h2>
				<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-zinc-800 p-8 mb-10">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-xl font-bold text-blue-700 dark:text-blue-200">Rooms</h3>
						<AppButton
							className="bg-gradient-to-r from-green-600 to-green-400 text-white px-4 py-2 rounded shadow hover:scale-105 transition-transform"
							onClick={() => setShowCreateModal(true)}
						>
							+ Create Room
						</AppButton>
					</div>
					{/* Table */}
					<div className="overflow-x-auto rounded-lg shadow w-full hide-scrollbar">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="bg-blue-50 dark:bg-zinc-800">
									<th className="p-3 text-left font-semibold">Name</th>
									<th className="p-3 text-center font-semibold">Capacity</th>
									<th className="p-3 text-center font-semibold">Rows</th>
									<th className="p-3 text-center font-semibold">Columns</th>
									<th className="p-3 text-center font-semibold">Premium Seats</th>
									<th className="p-3 text-center font-semibold">Empty Seats</th>
									<th className="p-3 text-center font-semibold">Created</th>
									<th className="p-3 text-center font-semibold">Updated</th>
									<th className="p-3 text-center font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody>
								{rooms.map(room => (
									<tr key={room.room_id} className="border-t transition hover:bg-blue-50 dark:hover:bg-zinc-800">
										<td className="p-3 font-bold text-blue-700 dark:text-blue-200">{room.room_name}</td>
										<td className="p-3 text-center">{room.room_capacity}</td>
										<td className="p-3 text-center">{room.room_rows}</td>
										<td className="p-3 text-center">{room.room_cols}</td>
										<td className="p-3 text-center">{room.premium_seats ? room.premium_seats.split(",").length : 0}</td>
										<td className="p-3 text-center">{room.empty_seats ? room.empty_seats.length : 0}</td>
										<td className="p-3 text-center">{room.created_at}</td>
										<td className="p-3 text-center">{room.updated_at}</td>
										<td className="p-3 text-center">
											<div className="flex gap-2 justify-center">
												<AppButton
													className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-3 py-1 rounded shadow hover:scale-105 transition-transform"
													onClick={() => openConfigModal(room)}
												>
													Configure
												</AppButton>
												<AppButton
													className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white px-3 py-1 rounded shadow hover:scale-105 transition-transform"
													onClick={() => openEditModal(room)}
												>
													Edit
												</AppButton>
												<AppButton
													className="bg-gradient-to-r from-red-600 to-red-400 text-white px-3 py-1 rounded shadow hover:scale-105 transition-transform"
													onClick={() => {
														setRoomToDelete(room.room_id);
														setShowDeleteModal(true);
													}}
												>
													Delete
												</AppButton>
											</div>
										</td>
									</tr>
								))}
								{rooms.length === 0 && (
									<tr>
										<td colSpan={9} className="p-3 text-center text-gray-400">No rooms found.</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
				{/* Modals */}
				{/* Create Room Modal */}
				<AnimatePresence>
					{showCreateModal && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
						>
							<div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100 dark:border-zinc-800">
								<button
									className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl"
									onClick={() => setShowCreateModal(false)}
									aria-label="Close"
								>
									×
								</button>
								<h3 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-200 text-center">Create Room</h3>
								<div className="flex flex-col gap-4">
									<label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
										Room Name:
										<input
											type="text"
											className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:ring-2 focus:ring-blue-400"
											value={newRoomName}
											onChange={e => setNewRoomName(e.target.value)}
											placeholder="Enter room name"
											maxLength={32}
										/>
									</label>
									{!newRoomName && (
										<span className="text-xs text-red-500">Room name is required.</span>
									)}
									<label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
										Rows:
										<input
											type="number"
											className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:ring-2 focus:ring-blue-400"
											value={newRoomRows}
											onChange={e => setNewRoomRows(Math.min(15, Math.max(1, Number(e.target.value))))}
											min={1}
											max={15}
											placeholder="Number of rows"
										/>
									</label>
									{newRoomRows > 15 && (
										<span className="text-xs text-red-500">Maximum rows is 15.</span>
									)}
									<label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
										Columns:
										<input
											type="number"
											className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:ring-2 focus:ring-blue-400"
											value={newRoomCols}
											onChange={e => setNewRoomCols(Math.min(10, Math.max(1, Number(e.target.value))))}
											min={1}
											max={10}
											placeholder="Number of columns"
										/>
									</label>
									{newRoomCols > 10 && (
										<span className="text-xs text-red-500">Maximum columns is 10.</span>
									)}
									<AppButton
										className="mt-4 bg-gradient-to-r from-green-600 to-green-400 text-white font-bold py-2 rounded shadow hover:scale-105 transition-transform"
										onClick={handleCreateRoom}
										disabled={!newRoomName || newRoomRows > 15 || newRoomCols > 10}
									>
										Create Room
									</AppButton>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				{/* Edit Room Modal */}
				<AnimatePresence>
					{showEditModal && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
						>
							<div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100 dark:border-zinc-800">
								<button
									className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl"
									onClick={() => setShowEditModal(false)}
									aria-label="Close"
								>
									×
								</button>
								<h3 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-200 text-center">Edit Room</h3>
								<div className="flex flex-col gap-4">
									<label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
										Room Name:
										<input
											type="text"
											className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:ring-2 focus:ring-blue-400"
											value={editRoomName}
											onChange={e => setEditRoomName(e.target.value)}
											placeholder="Enter room name"
										/>
									</label>
									<label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
										Rows:
										<input
											type="number"
											className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:ring-2 focus:ring-blue-400"
											value={editRoomRows}
											onChange={e => setEditRoomRows(Math.min(15, Math.max(1, Number(e.target.value))))}
											min={1}
											max={15}
											placeholder="Number of rows"
										/>
									</label>
									<label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
										Columns:
										<input
											type="number"
											className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:ring-2 focus:ring-blue-400"
											value={editRoomCols}
											onChange={e => setEditRoomCols(Math.min(10, Math.max(1, Number(e.target.value))))}
											min={1}
											max={10}
											placeholder="Number of columns"
										/>
									</label>
									<AppButton
										className="mt-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-white font-bold py-2 rounded shadow hover:scale-105 transition-transform"
										onClick={handleEditRoom}
									>
										Save Changes
									</AppButton>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				{/* Delete Room Modal */}
				<AnimatePresence>
					{showDeleteModal && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
						>
							<div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100 dark:border-zinc-800">
								<button
									className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl"
									onClick={() => setShowDeleteModal(false)}
									aria-label="Close"
								>
									×
								</button>
								<h3 className="text-2xl font-bold mb-6 text-red-700 dark:text-red-300 text-center">Delete Room</h3>
								<p className="mb-6 text-base text-gray-700 dark:text-gray-200 text-center">
									Are you sure you want to delete this room? This action cannot be undone.
								</p>
								<div className="flex gap-4 justify-end">
									<AppButton
										className="bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:scale-105 transition-transform"
										onClick={() => setShowDeleteModal(false)}
									>
										Cancel
									</AppButton>
									<AppButton
										className="bg-gradient-to-r from-red-600 to-red-400 text-white px-4 py-2 rounded shadow hover:scale-105 transition-transform"
										onClick={() => {
											if (roomToDelete !== null) {
												handleDeleteRoom(roomToDelete);
											}
										}}
									>
										Delete
									</AppButton>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				{/* Room Configuration Modal */}
				<AnimatePresence>
					{showConfigModal && selectedRoom && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
						>
							<div
								className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl relative border border-blue-100 dark:border-zinc-800 flex flex-col"
								style={{ maxHeight: "90vh" }}
							>
								{/* Make modal content scrollable if overflow */}
								<div className="p-8 overflow-y-auto hide-scrollbar" style={{ maxHeight: "90vh" }}>
									<button
										className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl"
										onClick={() => setShowConfigModal(false)}
										aria-label="Close"
									>
										×
									</button>
									<h3 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-200 text-center">
										Configure Seats for {selectedRoom.room_name}
									</h3>
									{/* Legends */}
									<div className="mt-4 flex gap-8 justify-center">
										<button
											type="button"
											className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all
												${filter === "economy" ? "bg-green-200 scale-105 shadow" : "hover:bg-green-100"}
											`}
											onClick={() => setFilter(filter === "economy" ? "all" : "economy")}
										>
											<span className="w-5 h-5 rounded-lg bg-green-200 border-2 border-green-500"></span>
											<span className="text-base text-green-900 font-semibold">Economy</span>
										</button>
										<button
											type="button"
											className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all
												${filter === "premium" ? "bg-yellow-200 scale-105 shadow" : "hover:bg-yellow-100"}
											`}
											onClick={() => setFilter(filter === "premium" ? "all" : "premium")}
										>
											<span className="w-5 h-5 rounded-lg bg-yellow-300 border-2 border-yellow-500"></span>
											<span className="text-base text-yellow-900 font-semibold">Premium</span>
										</button>
									</div>
									{/* Screen Indicator */}
									<div className="flex flex-col items-center w-full mt-8 mb-2">
										<div className="flex justify-center w-full">
											<div className="w-2/3 max-w-lg h-8 bg-blue-300 dark:bg-blue-900 rounded-t-2xl flex items-center justify-center shadow text-blue-900 dark:text-blue-200 font-semibold border-b-2 border-blue-500">
												Screen
											</div>
										</div>
										<span className="text-xs text-blue-500 dark:text-blue-300 mt-1">Front</span>
									</div>
									{/* Seat Grid */}
									<div
										className="w-full overflow-x-auto flex justify-center"
										style={{ minHeight: 420 }}
									>
										<div
											className="grid gap-2"
											style={{
												gridTemplateRows: `repeat(${selectedRoom.room_rows ?? ROWS}, 1fr)`,
												gridTemplateColumns: `repeat(${selectedRoom.room_cols ?? COLS}, 1fr)`,
												width: `min(${(selectedRoom.room_cols ?? COLS) * 3.2}rem, 100%)`,
												maxWidth: "100%",
											}}
										>
											{Array.from({ length: selectedRoom.room_rows ?? ROWS }).map((_, rowIdx) =>
												Array.from({ length: selectedRoom.room_cols ?? COLS }).map((_, colIdx) => {
													const id = seatId(rowIdx, colIdx);
													const isPremium = localPremiumSeats.includes(id);
													const isEmpty = localEmptySeats.includes(id);

													let shouldBlur = false;
													if (filter === "economy" && !isEmpty && isPremium) shouldBlur = true;
													if (filter === "premium" && !isEmpty && !isPremium) shouldBlur = true;

													let switchTooltip = "";
													if (!isEmpty && filter === "all") {
														switchTooltip = isPremium
															? "Click to switch to Economy"
															: "Click to switch to Premium";
													}

													const removeTooltip = "Remove seat";
													const restoreTooltip = "Click to restore seat";

													if (isEmpty) {
														return (
															<div key={id} className="relative flex items-center justify-center">
																<button
																	className="w-10 h-10 aspect-square rounded-lg border-2 border-gray-300 bg-gray-100 dark:bg-zinc-900 text-gray-400 flex items-center justify-center font-bold text-sm opacity-50"
																	onClick={() => setLocalEmptySeats(localEmptySeats.filter(s => s !== id))}
																	aria-label={`Restore seat ${id}`}
																	title={restoreTooltip}
																	onMouseEnter={() => setHoveredSeat(id)}
																	onMouseLeave={() => setHoveredSeat(null)}
																>
																	+
																</button>
																<AnimatePresence>
																	{hoveredSeat === id && (
																		<motion.div
																			initial={{ opacity: 0, y: 10, scale: 0.95 }}
																			animate={{ opacity: 1, y: -35, scale: 1 }}
																			exit={{ opacity: 0, y: 10, scale: 0.95 }}
																			transition={{ type: "spring", stiffness: 260, damping: 20 }}
																			className="absolute left-1/2 -translate-x-1/2 -top-10 z-50 px-4 py-2 rounded bg-black text-white text-xs shadow-lg pointer-events-none"
																		>
																			{restoreTooltip}
																		</motion.div>
																	)}
																</AnimatePresence>
															</div>
														);
													}

													return (
														<div
															key={id}
															className={`relative flex items-center justify-center group ${shouldBlur ? "opacity-30 grayscale pointer-events-none" : ""}`}
															onMouseEnter={() => setHoveredSeat(id)}
															onMouseLeave={() => setHoveredSeat(null)}
														>
															<button
																className={`w-10 h-10 aspect-square rounded-lg flex items-center justify-center border-2 font-bold text-sm transition-colors duration-200 shadow-sm
																	${isPremium
																		? "bg-yellow-300 text-yellow-900 border-yellow-500 ring-2 ring-yellow-400"
																		: "bg-green-200 text-green-900 border-green-500 hover:bg-green-300"}
																	hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400`}
																onClick={() => {
																	let newPremiumSeats: string[];
																	if (filter === "economy") {
																		newPremiumSeats = localPremiumSeats.filter(s => s !== id);
																	} else if (filter === "premium") {
																		newPremiumSeats = localPremiumSeats.includes(id)
																			? localPremiumSeats
																			: [...localPremiumSeats, id];
																	} else {
																		newPremiumSeats = localPremiumSeats.includes(id)
																			? localPremiumSeats.filter(s => s !== id)
																			: [...localPremiumSeats, id];
																	}
																	setLocalPremiumSeats(newPremiumSeats);
																}}
																aria-label={`Seat ${id}`}
																title={switchTooltip}
															>
																{id}
															</button>
															<AnimatePresence>
																{hoveredSeat === id && (
																	<motion.button
																		initial={{ opacity: 0, scale: 0.8, y: -10 }}
																		animate={{ opacity: 1, scale: 1, y: 0 }}
																		exit={{ opacity: 0, scale: 0.8, y: -10 }}
																		transition={{ type: "spring", stiffness: 260, damping: 20 }}
																		className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg border-2 border-white z-10"
																		style={{ fontSize: "1rem", cursor: "pointer" }}
																		title={removeTooltip}
																		onClick={e => {
																			e.stopPropagation();
																			setLocalEmptySeats([...localEmptySeats, id]);
																		}}
																		onMouseEnter={() => setHoveredSeat(id)}
																		onMouseLeave={() => setHoveredSeat(null)}
																	>
																		×
																	</motion.button>
																)}
															</AnimatePresence>
															<AnimatePresence>
																{hoveredSeat === id && switchTooltip && filter === "all" && (
																	<motion.div
																		initial={{ opacity: 0, y: 10, scale: 0.95 }}
																		animate={{ opacity: 1, y: -35, scale: 1 }}
																		exit={{ opacity: 0, y: 10, scale: 0.95 }}
																		transition={{ type: "spring", stiffness: 260, damping: 20 }}
																		className="absolute left-1/2 -translate-x-1/2 -top-10 z-50 px-4 py-2 rounded bg-black text-white text-xs shadow-lg pointer-events-none"
																	>
																		{switchTooltip}
																	</motion.div>
																)}
															</AnimatePresence>
														</div>
													);
												})
											).flat()}
										</div>
									</div>
									{/* Door Indicator */}
									<div className="flex flex-col items-center w-full mt-6">
										<div className="w-32 h-10 bg-gray-300 dark:bg-zinc-700 rounded-b-2xl flex items-center justify-center shadow text-gray-700 dark:text-gray-200 font-semibold border-t-2 border-gray-400">
											Door
										</div>
									</div>
								</div>
								{/* Update Button - Centered */}
								<div className="flex justify-center mt-6 w-full">
									<AppButton
										color="primary"
										className="w-full sm:w-auto"
										onClick={handleUpdateSeats}
										disabled={loading}
									>
										{loading ? (
											<span className="flex items-center gap-2">
												<span className="animate-spin h-4 w-4 border-2 border-t-blue-600 border-blue-200 rounded-full"></span>
												Updating...
											</span>
										) : (
											"Update Room Seats"
										)}
									</AppButton>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				<SatelliteToast ref={toastRef} />
			</div>
		</div>
	);
}