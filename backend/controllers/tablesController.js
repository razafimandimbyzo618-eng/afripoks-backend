const asyncHandler = require("express-async-handler");
const Table = require("../model/Table");
const serverSocket = require("../serverSocket");
const playerTablesMap = require("../game/playerTables");
const HistoriqueMain = require("../model/HistoriqueMain");

exports.findAll = asyncHandler(async (req, res)=> {
    try {
        const tables = await Table.findAll();
        const tableIds = tables.map(t => t.id);
        const occupiedSeatsMap = serverSocket.getFreeSits(tableIds);
        
        const dataWithActiveInfo = tables.map(t => {
            const tableData = t.toJSON();
            const activeTable = serverSocket.findTable(String(t.id));
            if (activeTable) {
                tableData.activeGameType = activeTable.gameType;
            }
            return tableData;
        });

        for (let i = 1; i <= tables.length; i++) {
          
          if (occupiedSeatsMap.get(i) === undefined) {
            occupiedSeatsMap.set(i, 9);
          }
        }
        
        const occupiedSeats = Object.fromEntries(occupiedSeatsMap);
        
        res.json({message: "all", data: dataWithActiveInfo, occupiedSeats});
    } catch (error) {
        res.status(401).json('Invalid Email or password');   
    }
});

exports.findById = asyncHandler(async (req, res)=> {
    try {
        const tables = await Table.findByPk(req.params.id);
        res.json({message: "table", data: tables});
    } catch (error) {
        res.status(401).json('Invalid Email or password');   
    }
});

exports.isUserInTable = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const playerTables = playerTablesMap.get(Number(userId));
        
        console.log('[USER IN TABLE] user id', userId);
        console.log('[USER IN TABLE] player table', playerTables);
        
        res.json(playerTables !== undefined && playerTables.length > 0);
    } catch (error) {
      console.error('[USER IN TABLE] ERR', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

exports.getLastHistory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const table = await Table.findByPk(id);
        
        if (!table) {
            return res.status(404).json({ message: "Table non trouvée." });
        }
        
        const historique = await HistoriqueMain.findOne({
            where: {
                table_name: table.name
            },
            order: [['datetime', 'DESC']]
        });
        
        if (!historique) {
            return res.status(404).json({ message: "Aucun historique trouvé pour cette table." });
        }
        
        // Extraire tous les noms des joueurs
        const joueurs = new Set();
        if (historique.main_joueurs && Array.isArray(historique.main_joueurs)) {
            historique.main_joueurs.forEach(j => j.pseudo && joueurs.add(j.pseudo));
        }
        if (historique.foldes && Array.isArray(historique.foldes)) {
            historique.foldes.forEach(nom => nom && joueurs.add(nom));
        }
        if (historique.gagnants && Array.isArray(historique.gagnants)) {
            historique.gagnants.forEach(nom => nom && joueurs.add(nom));
        }
        
        const response = {
            ...historique.toJSON(),
            joueurs: Array.from(joueurs)
        };
        
        res.json(response);
    } catch (error) {
        console.error("Erreur lors de la récupération du dernier historique :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du dernier historique." });
    }
});