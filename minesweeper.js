/** 1セルのサイズ(px) */
const panelSize = Object.freeze({
    /** 幅 */
    w:25,
    /** 高さ */
    h:25
});

/** セルの状態 */
const Status = Object.freeze({
    /** 初期状態 */
    Init:0,
    /** フラグ設定済 */
    SetFlg:1,
    /** セルオープン済 */
    PanelOpen:2
});

/** セルに設定する数字の色 */
const DefCharColor =Object.freeze({
    1:"blue",
    2:"green",
    3:"red",
    4:"purple",
    5:"black",
    6:"yellow",
    7:"orange",
    8:"skyblue"
});

/** ゲームメニューで設定するレベル */
const GAME_LEVEL = Object.freeze({
    EASY:{bombNum:10,panelNum:{x:9,y:9}},
    NORMAL:{bombNum:40,panelNum:{x:16,y:16}},
    HARD:{bombNum:99,panelNum:{x:30,y:16}}
});

/** セルテーマ */
const CELL_THEMS = Object.freeze({
    /** 初期 */
    INIT : {fillRectStyle : "lightgray",
            strokeStyle : "white",
            lineWidth : 1,
            textAlign : "center",
            textBaseline : "middle",
            font : "20px sans-serif",
            fillTextStyle : 'black',
            fillText : "",
            status : Status.Init},
    /** 爆弾オープン */
    BOMB : {fillRectStyle : "red",
            strokeStyle : "white",
            lineWidth : 1,
            textAlign : "center",
            textBaseline : "middle",
            font : "20px sans-serif",
            fillTextStyle : 'black',
            fillText : "💣",
            status : Status.PanelOpen},
    /** 旗を追加 */
    FLG : {fillRectStyle : "lightgray",
            strokeStyle : "white",
            lineWidth : 1,
            textAlign : "center",
            textBaseline : "middle",
            font : "20px sans-serif",
            fillTextStyle : 'black',
            fillText : "🚩",
            status : Status.SetFlg},
    /** セルオープン（数値あり） */
    OPEN : {fillRectStyle : "lightgray",
            strokeStyle : "white",
            lineWidth : 1,
            textAlign : "center",
            textBaseline : "middle",
            font : "20px sans-serif",
            fillTextStyle : "",
            fillText : "",
            status : Status.PanelOpen},
    /** セルオープン（数値なし） */
    BLANK : {fillRectStyle : "white",
            strokeStyle : "white",
            lineWidth : 1,
            textAlign : "center",
            textBaseline : "middle",
            font : "20px sans-serif",
            fillTextStyle : "white",
            fillText : "",
            status : Status.PanelOpen}
});

/** セルの座標クラス */
class Position{
        constructor(x,y){
            this.x = x;
            this.y = y;
        }
    }

/** セル定義クラス */
class Panel{
    /**
     * Create a point.
     * @param {Position} position セルの座標
     * @param {boolean} bomFlg 爆弾が配置されているか
     * @param {number} aroundBomCount 周辺8セルの爆弾の個数
     * @param {Status} status セルの状態
     */
    constructor(position,bomFlg,aroundBomCount,status){
        this.position = position;
        this.bomFlg = bomFlg;
        this.aroundBomCount = aroundBomCount;
        this.status = status;
    }
}  

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("#myCanvas");
/** @type {CanvasRenderingContext2D} */ 
const ctx = canvas.getContext("2d");

/**
 * キャンバスにセルを配置
 * @param {GAME_LEVEL} level
 */
function createArea(){
    //キャンバス定義
    canvas.width = gameLevel.panelNum.x * panelSize.w;
    canvas.height = gameLevel.panelNum.y * panelSize.h;
    let root = document.documentElement;
    root.style.setProperty('--w-size', gameLevel.panelNum.x * panelSize.w + 'px');
    root.style.setProperty('--h-size', gameLevel.panelNum.y * panelSize.h + 'px');

    //初期化処理
    document.querySelector("#mines").textContent = String(gameLevel.bombNum).padStart(3,0);
    document.querySelector("#secounds").textContent = "000";

    for(let j=0;j<=gameLevel.panelNum.y * panelSize.h;j+=panelSize.h){
        for(let i=0;i<=gameLevel.panelNum.x * panelSize.w;i+=panelSize.w){
            setCell(new Panel({x:i,y:j}),CELL_THEMS.INIT);
        }
    }

    // 爆弾用の配列作成
    let numbers = Array.from({ length: gameLevel.panelNum.x * gameLevel.panelNum.y }, (_, i) => i + 1);
    // 配列をシャッフル（フィッシャー–イェーツ法）
    for (let i = numbers.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    //先頭から必要な分、爆弾配列取得
    let result = numbers.slice(0, gameLevel.bombNum);

    //盤面設定
    return createPanel(gameLevel.panelNum.x,gameLevel.panelNum.y,result);
}

/**
 * セル作成
 * @param {number} xCount
 * @param {number} yCount
 * @param {number[]} result
 */
function createPanel(xCount,yCount,result){
        let cnt = 1;
        const array = [];
        for(let i=0;i<yCount;i++){
            array[i] = [];
            for(let j=0;j<xCount;j++,cnt++){
                let panel = new Panel(
                    new Position(j*panelSize.w, i*panelSize.h),
                    Boolean(result.find(v => v===cnt)),
                    null,   //後で
                    Status.Init
                );
                array[i][j] = panel;
        }
    }

    //後でを設定
    array.forEach((v1,i1,a1) =>{
        v1.forEach((v2,i2,a2) =>{
            let wCnt = 0;
            if((i1 - 1) >= 0 && (i2 - 1) >= 0 && Number(a1[i1-1][i2-1].bomFlg)) wCnt++;
            if((i1 - 1) >= 0 && Number(a1[i1-1][i2].bomFlg)) wCnt++;
            if((i1 - 1) >= 0 && (i2 + 1) < xCount && Number(a1[i1-1][i2+1].bomFlg)) wCnt++;
            if((i2 + 1) < xCount && Number(a1[i1][i2+1].bomFlg)) wCnt++;
            if((i1 + 1) < yCount && (i2 + 1) < xCount && Number(a1[i1+1][i2+1].bomFlg)) wCnt++;
            if((i1 + 1) < yCount && Number(a1[i1+1][i2].bomFlg)) wCnt++;
            if((i1 + 1) < yCount && (i2 - 1) >= 0 && Number(a1[i1+1][i2-1].bomFlg)) wCnt++;
            if((i2 - 1) >= 0 && Number(a1[i1][i2-1].bomFlg)) wCnt++;
            v2.aroundBomCount = wCnt;
        })
    })
    return array;
}

/** 
 * レベル変更
 * @param {GameLevel} lev
*/
function setLevel(lev){
    gameLevel = lev;
    array = createArea();
}
        
/** @type {HTMLButtonElement} */
const buttonReset = document.querySelector("#reset");
/** @type {HTMLOutputElement} */
const outputTimer = document.querySelector("#secounds");
/** @type {HTMLOutputElement} */
const outputMines = document.querySelector("#mines");

//イベントリスナー追加（メニューからレベル選択時）
document.querySelector("#level-easy").addEventListener("click",(ev)=>setLevel(GAME_LEVEL.EASY));
document.querySelector("#level-normal").addEventListener("click",(ev)=>setLevel(GAME_LEVEL.NORMAL));
document.querySelector("#level-hard").addEventListener("click",(ev)=>setLevel(GAME_LEVEL.HARD));

//イベントリスナー追加（マウス左クリック時）
canvas.addEventListener("click",e => {
    checkPanel(e);
    checkComplete();
})

//イベントリスナー追加（マウス右クリック時）
canvas.addEventListener("contextmenu",e => {
    // ブラウザのメニューが出るのを阻止
    e.preventDefault();
    checkPanel2(e);
})

//スマホ用
    let longPressTimer;

    canvas.addEventListener('touchstart', (e) => {
    // 1本指の場合のみ処理
    if (e.touches.length > 1) return;
    const touch = e.touches[0];
    // タイマー開始
    longPressTimer = setTimeout(() => {
        // ここで直接 checkPanel2 を呼ぶ
        // e（元のイベント）はここでも有効なので preventDefault が呼べます
        if (e.cancelable) e.preventDefault(); 
        
        // 座標情報を渡す
        checkPanel2(touch); 
        
        // 動作確認用
        console.log("長押し成功");
    }, 500);
}, { passive: false }); // preventDefaultを呼ぶために passive: false が必須

canvas.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
});

canvas.addEventListener('touchmove', () => {
    clearTimeout(longPressTimer);
});

//イベントリスナー追加（リセットボタン押下時）
buttonReset.addEventListener("click",e => {
    array = createArea();
    document.querySelector("#secounds").textContent = "000";
});

//タイマー起動
setInterval(() => {
    let wTime = parseInt(outputTimer.textContent) + 1;
    if(wTime > 999) {wTime = 0;}
    outputTimer.textContent = String(wTime).padStart(3,0);
},1000);

/**
 * セルの状態を確認し、セルを更新する（セルOPEN用）
 * @param {PointerEvent} e
 */
function checkPanel(e){
    array.flat().forEach((v,i) => {
        if(
            //クリック位置に該当するセルを判定
            (v.position.x <= e.offsetX) &&
            (e.offsetX < (v.position.x + panelSize.w)) && 
            (v.position.y <= e.offsetY) && 
            (e.offsetY < (v.position.y + panelSize.h))
        ){
            //フラグがあるセルは何もしない
            if(v.status === Status.SetFlg) return;
            //爆弾セル
            if(v.bomFlg) {
                setCell(v,CELL_THEMS.BOMB);
                gameOver();
            //周囲に爆弾がないセル
            } else if(v.aroundBomCount === 0){
                setBlank(getPosFromFlatIndex(i));
            //周囲に爆弾があるセル
            } else {
                setNumber2(getPosFromFlatIndex(i));
            }

        };
    });
}

/** 
 * 一次元配列から2次元配列の添え字を取得する
 * @param {number} i 1次元配列の添え字
 * @returns {{x:number,y:number}} 
*/
function getPosFromFlatIndex(i){
    const xIndex = i % gameLevel.panelNum.x;
    const yIndex = parseInt(i / gameLevel.panelNum.x);
    return {x:xIndex,y:yIndex};
}

/**
 * ゲームオーバー時の処理
 */
async function gameOver(){
    let prom = () => new Promise(
        (resolve)=>{
            setTimeout(() => {
                alert("GAME OVER");
                resolve();
            },100);
            
        });
    await prom();
    array = createArea();
}

/**
 * 盤面の爆弾以外のセルがすべて開かれているかチェックする
 */
async function checkComplete(){
    if(!(array.flat().some(v=>!v.bomFlg && v.status !== Status.PanelOpen))) {
        let prom = () => new Promise(
            (resolve) => {setTimeout(() => {
                alert("CONGRATULATION!");
                resolve();
            },100);
            
        });
        await prom();
        array = createArea();
    }
}

/**
 * セルをオープンし、ブランクを設定する
 * また、周辺セルもブランクであれば再帰的に処理する
 * @param {{x,y}} x,y チェック対象セルの2次元配列の添え字
 */
function setBlank({x,y}){
    let p = array?.[y]?.[x];
    if(p !== undefined && p.aroundBomCount ===0 && p.status !== Status.PanelOpen && p.status !== Status.SetFlg){
        setCell(p,CELL_THEMS.BLANK);

        //再帰的に周辺パネルのブランク設定
        setBlank({x:x,y:y-1});
        setBlank({x:x+1,y:y-1});
        setBlank({x:x+1,y:y});
        setBlank({x:x+1,y:y+1});
        setBlank({x:x,y:y+1});
        setBlank({x:x-1,y:y+1});
        setBlank({x:x-1,y:y});
        setBlank({x:x-1,y:y-1});

        //ブランクの周辺の数値パネルオープン
        setNumber2({x:x,y:y-1});
        setNumber2({x:x+1,y:y-1});
        setNumber2({x:x+1,y:y});
        setNumber2({x:x+1,y:y+1});
        setNumber2({x:x,y:y+1});
        setNumber2({x:x-1,y:y+1});
        setNumber2({x:x-1,y:y});
        setNumber2({x:x-1,y:y-1});
    }
}

/**
 * セルをオープンし、周辺の爆弾数を設定する
 * @param {{x,y}} x,y チェック対象セルの2次元配列の添え字
 */
function setNumber2({x,y}){
    let p = array?.[y]?.[x];
    if(p !== undefined && p.aroundBomCount !==0 && p.status !== Status.PanelOpen && p.status !== Status.SetFlg){
        setCell(p,CELL_THEMS.OPEN);
    }
}

/**
 * セルの状態を確認し、セルを更新する（フラグ設定・解除用）
 * @param {PointerEvent} e クリック時に取得したイベント
 */
function checkPanel2(e){
    array.flat().forEach((v,i) => {
        if(
            //クリック位置に該当するセルを判定
            (v.position.x <= e.offsetX) &&
            (e.offsetX < (v.position.x + panelSize.w)) && 
            (v.position.y <= e.offsetY) && 
            (e.offsetY < (v.position.y + panelSize.h))
        ){
            if(v.status === Status.Init) {
                setCell(v,CELL_THEMS.FLG);
                setOutputMines(-1);
            } else if(v.status === Status.SetFlg){
                setCell(v,CELL_THEMS.INIT);
                setOutputMines(1);
            }

        };
    });
}

/**
 *  Outputの爆弾数変更 
 * @param {number} c 増減値
*/
function setOutputMines(c){
    let cnt = parseInt(outputMines.textContent) + c;
        if(cnt < 0) {
            outputMines.textContent = String(cnt);
        } else {
            outputMines.textContent = String(cnt).padStart(3,0);
        }
}

/**
 * セルを更新
 * @param {Panel} p
 * @param {CELL_THEMS} c
*/
function setCell(p,c){
    ctx.fillStyle = c.fillRectStyle;
    ctx.fillRect(p.position.x,p.position.y,panelSize.w,panelSize.h);
    ctx.strokeStyle = c.strokeStyle;
    ctx.lineWidth = c.lineWidth;
    ctx.strokeRect(p.position.x,p.position.y,panelSize.w,panelSize.h);
    ctx.textAlign = c.textAlign;
    ctx.textBaseline = c.textBaseline;
    ctx.font = c.font;
    ctx.fillStyle = (c === CELL_THEMS.OPEN ? DefCharColor[p.aroundBomCount] : c.fillTextStyle);
    ctx.fillText((c === CELL_THEMS.OPEN ? p.aroundBomCount : c.fillText), p.position.x + panelSize.w/2,p.position.y + panelSize.h/2);
    p.status = c.status;
}

/** @type {GAME_LEVEL} */ 
let gameLevel = GAME_LEVEL.EASY;
/** @type {any[][]} */ 
let array = createArea();