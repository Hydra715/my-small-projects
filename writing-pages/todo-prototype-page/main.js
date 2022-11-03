"use strict";

/*
 1. Создание пункта после нажатия клавиши ent (+)
 2. Отрисовать все пункты (+)
 3. Удаление пункта по клику на иконку корзины (+)
 4. Редактирование пункта по двойному клику по тексту (добавить сохранение элементов)
 5. Фильтрацию списка по кнопкам фильтров
 6. Подсчёт и склонение
 7. Очистка всех выполненных задач
*/



const todoList = [
  {
  done: false,
  text: 'Сходить за хлебом'
  },
  
  {
  done: true,
  text: 'Выйти на улицу'
  } 
]

const $list = document.getElementById('list');
const $todoTpl = document.getElementById('todoTpl');
const $counts = document.getElementById('counts');

function declOfNum(n, textForms) {  
  n = Math.abs(n) % 100; 
  const n1 = n % 10;
  if (n > 10 && n < 20) { return textForms[2]; }
  if (n1 > 1 && n1 < 5) { return textForms[1]; }
  if (n1 == 1) { return textForms[0]; }
  return textForms[2];
}


function createEditListener(todo, $input) {
  return function editListener(e) {
    if (e.key === 'Enter') {
      todo.textContent = $input.value.trim();
      renderList();
    }
  }
}


function renderList(){

 $list.innerHTML = ''
 
 let doneCount = 0;
 todoList.forEach((todo) => {
   
   const $node = $todoTpl.content.cloneNode(true);
   const $textNode = $node.querySelector('.itemText')
   const $todo = $node.firstElementChild;
   const $checkbox = $node.querySelector('.checkboxInput')
   const $remove = $node.querySelector('.itemRemove')
   const $input = $node.querySelector('.itemInput')

   let listenerEnter = createEditListener(todo, $input)

    $input.addEventListener('blur', () => {
      $todo.classList.remove('edited');

      document.removeEventListener('keyup', listenerEnter);
    });
    
    $textNode.addEventListener('dblclick', () => {
      $todo.classList.add('edited');
      $input.focus();

      document.addEventListener('keyup', listenerEnter);
    }) 

    $textNode.textContent = todo.text;
    $input.value = $textNode.textContent
   
    $input.addEventListener('blur',(event) => {
     $todo.classList.remove('edited');
    })
  
    $remove.addEventListener('click', (event) => {
     const index = todoList.indexOf(todo)
     todoList.splice(index, 1)
     renderList()
    })


    $textNode.addEventListener('dblclick', (event) => {
     $todo.classList.add('edited')
     $input.focus();

     
   })

    $checkbox.addEventListener('change', () => {
      if ($checkbox.checked) {
       todo.done = true
       renderList()
      } else {
       todo.done = false
       renderList()
      }
    });

  
   $textNode.textContent = todo.text;
  
   if (todo.done) {
    $todo.classList.add('complited')
    $checkbox.checked = true
    doneCount += 1
   }
  
   $list.appendChild($node);
  });
 
  const backlogCount = todoList.length - doneCount;
  $counts.textContent = `Осталось ${backlogCount} ${declOfNum(backlogCount, ['дело', 'дела', 'дел'])}`;
 //$counts.textContent = `Осталось ${doneCount} ${declOfNum(doneCount, ['дело','дела','дел'])}`
}

renderList();

const $form = document.getElementById('form');
const $formInput = document.getElementById('formInput');

$form.addEventListener('submit',(event) => {
 event.preventDefault();
 const text = $formInput.value.trim();

 const todo = {
  done: false,
  text: text
 }

 $formInput.value = ''
 todoList.push(todo);

 renderList();
 
})